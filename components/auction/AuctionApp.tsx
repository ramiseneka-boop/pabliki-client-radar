"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  addAuctionActivity,
  AuctionActivity,
  AuctionCompany,
  AuctionSegment,
  AuctionSession,
  bootstrapAuction,
  createAuctionCompany,
  getAuctionSession,
  loadAuctionActivities,
  loadAuctionData,
  signInAuction,
  signOutAuction,
  signUpAuction,
  updateAuctionCompany,
} from "@/lib/softwareAuctionApi";
import { AUCTION_WIN_CONDITIONS, FUNNEL_STAGES } from "@/lib/auctionSeed";

type Tab = "today" | "companies" | "auction" | "segments";

const STAGE_INDEX = new Map(FUNNEL_STAGES.map((s, i) => [s.key, i]));
const closedStages = new Set(["won", "lost"]);

function money(value: number | null | undefined) {
  if (!value) return "—";
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₸`;
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return `${d}.${m}.${y}`;
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysUntil(value: string | null | undefined) {
  if (!value) return null;
  const now = new Date(`${todayISO()}T00:00:00`);
  const target = new Date(`${value}T00:00:00`);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

function stageLabel(stage: string) {
  return FUNNEL_STAGES.find((s) => s.key === stage)?.label || stage;
}

function getStageGate(company: AuctionCompany) {
  const idx = STAGE_INDEX.get(company.stage as any) ?? 0;
  const needs = (key: string) => idx >= (STAGE_INDEX.get(key as any) ?? 999);
  const errors: string[] = [];
  if (needs("lpr_found") && (!company.decision_maker_name.trim() || !company.decision_maker_contact.trim())) {
    errors.push("Для этапа «ЛПР найден» нужны имя и контакт конкретного ЛПР.");
  }
  if (needs("discovery") && !company.dm_conversation) errors.push("Discovery считается только после разговора с ЛПР.");
  if (needs("tco_confirmed") && (!company.actual_tco_kzt || !company.renewal_date)) {
    errors.push("Нужны подтвержденный TCO и дата renewal.");
  }
  if (needs("demo") && (!company.competitor_confirmed || !company.demo_committed)) {
    errors.push("Для Demo подтвердите используемого конкурента и commitment на demo.");
  }
  if (needs("migration_test") && !company.migration_data_committed) {
    errors.push("Для теста миграции клиент должен согласиться дать данные/экспорт.");
  }
  if (needs("offer") && (!company.proposed_price_kzt || !company.pain.trim() || !company.must_keep.trim())) {
    errors.push("До КП зафиксируйте боль, must-have функционал и цену оффера.");
  }
  if (needs("deposit") && (!company.deposit_committed || !company.deposit_kzt)) {
    errors.push("Этап «Депозит» требует commitment и суммы депозита.");
  }
  if (needs("won") && !company.won_value_kzt) errors.push("Для WON укажите фактически полученную/законтрактованную сумму.");
  return errors;
}

function auctionScore(segment: AuctionSegment, companies: AuctionCompany[]) {
  const rows = companies.filter((c) => c.segment_id === segment.id);
  const dm = rows.filter((c) => c.dm_conversation).length;
  const confirmed = rows.filter((c) => c.competitor_confirmed).length;
  const demos = rows.filter((c) => c.demo_committed).length;
  const migrations = rows.filter((c) => c.migration_data_committed).length;
  const deposits = rows.filter((c) => c.deposit_committed).length;
  const tco = rows.reduce((sum, c) => sum + Number(c.actual_tco_kzt || 0), 0);
  const score =
    Math.min(dm / 10, 1) * 30 +
    Math.min(tco / 20_000_000, 1) * 20 +
    Math.min(demos / 3, 1) * 20 +
    Math.min(confirmed / 5, 1) * 15 +
    (segment.migration_ease / 10) * 10 +
    (segment.build_ease / 10) * 5;
  const won =
    dm >= AUCTION_WIN_CONDITIONS.dm_conversations &&
    confirmed >= AUCTION_WIN_CONDITIONS.competitor_confirmed &&
    demos >= AUCTION_WIN_CONDITIONS.demo_committed &&
    migrations >= AUCTION_WIN_CONDITIONS.migration_data_committed &&
    deposits >= AUCTION_WIN_CONDITIONS.deposit_committed;
  return { rows, dm, confirmed, demos, migrations, deposits, tco, score: Math.round(score), won };
}

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "blue" | "green" | "amber" | "red" }) {
  const cls = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>;
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      {sub ? <div className="mt-1 text-xs text-slate-500">{sub}</div> : null}
    </div>
  );
}

export default function AuctionApp() {
  const [session, setSession] = useState<AuctionSession | null>(null);
  const [segments, setSegments] = useState<AuctionSegment[]>([]);
  const [companies, setCompanies] = useState<AuctionCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("today");
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [editing, setEditing] = useState<AuctionCompany | null>(null);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState<AuctionActivity[]>([]);
  const [activityDraft, setActivityDraft] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanySegment, setNewCompanySegment] = useState("");

  async function hydrate(s: AuctionSession) {
    setError("");
    const data = await bootstrapAuction(s);
    setSegments(data.segments);
    setCompanies(data.companies);
  }

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const s = await getAuctionSession();
        if (!live) return;
        setSession(s);
        if (s) await hydrate(s);
      } catch (e: any) {
        if (live) setError(e?.message || "Ошибка запуска CRM");
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  async function authSubmit(e: FormEvent) {
    e.preventDefault();
    setAuthMessage("");
    setError("");
    setLoading(true);
    try {
      if (password.length < 8) throw new Error("Пароль должен быть не короче 8 символов.");
      if (authMode === "login") {
        const s = await signInAuction(email.trim(), password);
        setSession(s);
        await hydrate(s);
      } else {
        const result = await signUpAuction(email.trim(), password);
        if (result.session) {
          setSession(result.session);
          await hydrate(result.session);
        } else {
          setAuthMessage("Аккаунт создан. Если в Supabase включено подтверждение email — подтвердите письмо и затем войдите.");
          setAuthMode("login");
        }
      }
    } catch (e: any) {
      setError(e?.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  }

  async function openCompany(company: AuctionCompany) {
    setEditing({ ...company });
    setActivities([]);
    setActivityDraft("");
    if (session) {
      try {
        setActivities(await loadAuctionActivities(session, company.id));
      } catch {
        // Activity history is secondary; editor remains usable.
      }
    }
  }

  async function saveCompany() {
    if (!session || !editing) return;
    const gates = getStageGate(editing);
    if (gates.length) {
      setError(gates.join(" "));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const rows = await updateAuctionCompany(session, editing.id, editing);
      const saved = rows[0];
      if (!saved) throw new Error("Supabase не вернул обновленную карточку.");
      setCompanies((old) => old.map((c) => (c.id === saved.id ? saved : c)));
      setEditing(saved);
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить компанию");
    } finally {
      setSaving(false);
    }
  }

  async function addActivity() {
    if (!session || !editing || !activityDraft.trim()) return;
    setSaving(true);
    try {
      const rows = await addAuctionActivity(session, editing.id, activityDraft.trim(), "contact");
      setActivities((old) => [rows[0], ...old].filter(Boolean));
      setActivityDraft("");
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить касание");
    } finally {
      setSaving(false);
    }
  }

  async function addCompany(e: FormEvent) {
    e.preventDefault();
    if (!session || !newCompanyName.trim() || !newCompanySegment) return;
    setSaving(true);
    try {
      const rows = await createAuctionCompany(session, {
        name: newCompanyName.trim(),
        segment_id: newCompanySegment,
      });
      if (rows[0]) setCompanies((old) => [rows[0], ...old]);
      setNewCompanyName("");
    } catch (e: any) {
      setError(e?.message || "Не удалось добавить компанию");
    } finally {
      setSaving(false);
    }
  }

  const scores = useMemo(
    () => segments.map((s) => ({ segment: s, ...auctionScore(s, companies) })).sort((a, b) => b.score - a.score),
    [segments, companies]
  );

  const todayQueue = useMemo(() => {
    const today = todayISO();
    return companies
      .filter((c) => !closedStages.has(c.stage))
      .filter((c) => (c.next_action_date ? c.next_action_date <= today : c.tier === "A"))
      .sort((a, b) => {
        const ad = a.next_action_date || "9999-12-31";
        const bd = b.next_action_date || "9999-12-31";
        if (ad !== bd) return ad.localeCompare(bd);
        if (a.tier !== b.tier) return a.tier.localeCompare(b.tier);
        return (STAGE_INDEX.get(b.stage as any) || 0) - (STAGE_INDEX.get(a.stage as any) || 0);
      });
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      if (segmentFilter !== "all" && c.segment_id !== segmentFilter) return false;
      if (stageFilter !== "all" && c.stage !== stageFilter) return false;
      if (tierFilter !== "all" && c.tier !== tierFilter) return false;
      if (q && !`${c.name} ${c.current_software} ${c.decision_maker_name} ${c.decision_maker_role}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [companies, search, segmentFilter, stageFilter, tierFilter]);

  const wonCash = companies.reduce((sum, c) => sum + Number(c.won_value_kzt || 0), 0);
  const pipeline = companies
    .filter((c) => !closedStages.has(c.stage))
    .reduce((sum, c) => sum + Number(c.proposed_price_kzt || 0), 0);
  const verifiedTco = companies.reduce((sum, c) => sum + Number(c.actual_tco_kzt || 0), 0);
  const target = 46_000_000;

  function exportCsv() {
    const headers = [
      "Компания",
      "Сегмент",
      "Tier",
      "Этап",
      "Софт",
      "TCO факт",
      "Renewal",
      "ЛПР",
      "Контакт",
      "Следующий шаг",
      "Дата следующего шага",
      "Наш оффер",
      "WON",
    ];
    const rows = companies.map((c) => {
      const seg = segments.find((s) => s.id === c.segment_id)?.code || "";
      return [
        c.name,
        seg,
        c.tier,
        stageLabel(c.stage),
        c.current_software,
        c.actual_tco_kzt || "",
        c.renewal_date || "",
        `${c.decision_maker_name} ${c.decision_maker_role}`.trim(),
        c.decision_maker_contact,
        c.next_action,
        c.next_action_date || "",
        c.proposed_price_kzt || "",
        c.won_value_kzt || "",
      ];
    });
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((r) => r.map(escape).join(";")).join("\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `software-auction-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <div className="min-h-screen bg-canvas p-8 text-sm text-slate-500">Загружаю Software Auction CRM…</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 px-5 py-14 text-white">
        <div className="mx-auto max-w-md">
          <div className="mb-8">
            <Badge tone="blue">Software Auction CRM</Badge>
            <h1 className="mt-4 text-3xl font-bold">Охота на дорогой B2B SaaS</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">Личная CRM: 4 сегмента, рынок-аукцион, TCO, renewal, ЛПР, миграция, депозит и цель 46 млн ₸.</p>
          </div>
          <form onSubmit={authSubmit} className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
            <div className="mb-5 flex rounded-xl bg-slate-100 p-1 text-sm">
              <button type="button" onClick={() => setAuthMode("login")} className={`flex-1 rounded-lg px-3 py-2 font-semibold ${authMode === "login" ? "bg-white shadow" : "text-slate-500"}`}>Войти</button>
              <button type="button" onClick={() => setAuthMode("signup")} className={`flex-1 rounded-lg px-3 py-2 font-semibold ${authMode === "signup" ? "bg-white shadow" : "text-slate-500"}`}>Первый аккаунт</button>
            </div>
            <label className="text-sm font-medium">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" />
            <label className="text-sm font-medium">Пароль</label>
            <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" />
            {error ? <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
            {authMessage ? <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{authMessage}</div> : null}
            <button className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">{authMode === "login" ? "Войти в CRM" : "Создать личный аккаунт"}</button>
            <p className="mt-4 text-xs leading-5 text-slate-400">После создания своего аккаунта отключите новые регистрации в Supabase Auth — тогда CRM физически останется только вашей.</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-24 lg:pb-8">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><Badge tone="blue">AUCTION MODE</Badge><span className="text-xs text-slate-400">до 30.09.2026</span></div>
            <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">Software Auction CRM</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportCsv} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">CSV</button>
            <button type="button" onClick={async () => { signOutAuction(); setSession(null); setCompanies([]); setSegments([]); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500">Выйти</button>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 sm:px-6 lg:px-8">
        {error ? <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => setError("")} className="font-bold">×</button></div> : null}
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <b>Правило №1:</b> публичное обнаружение софта — только сигнал. «Компания переплачивает» считается доказанным только после счета/договора. До этого поле TCO остается оценкой или пустым.
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric label="Цель cash" value={money(target)} sub={`Собрано ${Math.round((wonCash / target) * 100)}%`} />
          <Metric label="WON" value={money(wonCash)} sub={`${companies.filter((c) => c.stage === "won").length} сделок`} />
          <Metric label="Открытый pipeline" value={money(pipeline)} sub="по нашим офферам" />
          <Metric label="Подтвержденный TCO" value={money(verifiedTco)} sub="только фактические данные" />
        </div>

        <div className="mb-6 hidden gap-2 lg:flex">
          {([
            ["today", "Сегодня"],
            ["companies", "Компании"],
            ["auction", "Рынок-аукцион"],
            ["segments", "Сегменты"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === key ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>{label}</button>
          ))}
        </div>

        {tab === "today" ? (
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div><h2 className="text-lg font-bold text-slate-900">Отработать сегодня</h2><p className="mt-1 text-sm text-slate-500">Просроченные next steps + Tier A без даты.</p></div>
              <Badge tone={todayQueue.length ? "amber" : "green"}>{todayQueue.length} задач</Badge>
            </div>
            <div className="space-y-3">
              {todayQueue.length ? todayQueue.map((c) => {
                const seg = segments.find((s) => s.id === c.segment_id);
                const renewal = daysUntil(c.renewal_date);
                return (
                  <button type="button" key={c.id} onClick={() => openCompany(c)} className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-card transition hover:border-blue-300">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-900">{c.name}</span><Badge tone="blue">{seg?.code}</Badge><Badge tone={c.tier === "A" ? "green" : c.tier === "B" ? "amber" : "slate"}>Tier {c.tier}</Badge></div>
                        <div className="mt-2 text-sm text-slate-600"><b>{c.next_action || "Назначить следующий шаг"}</b></div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400"><span>{c.current_software || "Софт не подтвержден"}</span><span>{stageLabel(c.stage)}</span>{renewal !== null ? <span className={renewal <= 90 ? "font-semibold text-amber-600" : ""}>renewal через {renewal} дн.</span> : null}</div>
                      </div>
                      <div className={`text-sm font-semibold ${c.next_action_date && c.next_action_date < todayISO() ? "text-red-600" : "text-slate-500"}`}>{dateLabel(c.next_action_date)}</div>
                    </div>
                  </button>
                );
              }) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Очередь пуста. Назначьте next action компаниям Tier A.</div>}
            </div>
          </section>
        ) : null}

        {tab === "companies" ? (
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-lg font-bold text-slate-900">Компании</h2><p className="mt-1 text-sm text-slate-500">Факты, TCO, renewal, ЛПР и следующий шаг.</p></div>
            </div>
            <form onSubmit={addCompany} className="mb-4 grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_180px_auto]">
              <input value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="Новая компания" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <select value={newCompanySegment} onChange={(e) => setNewCompanySegment(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">Сегмент</option>{segments.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
              </select>
              <button disabled={!newCompanyName.trim() || !newCompanySegment || saving} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Добавить</button>
            </form>
            <div className="mb-4 grid gap-2 md:grid-cols-4">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
              <select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">Все сегменты</option>{segments.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}</select>
              <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">Все этапы</option>{FUNNEL_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
              <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">Все Tier</option><option>A</option><option>B</option><option>C</option></select>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {filteredCompanies.map((c) => {
                const seg = segments.find((s) => s.id === c.segment_id);
                return (
                  <button key={c.id} type="button" onClick={() => openCompany(c)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-card hover:border-blue-300">
                    <div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-900">{c.name}</span><Badge tone="blue">{seg?.code}</Badge><Badge tone={c.tier === "A" ? "green" : c.tier === "B" ? "amber" : "slate"}>{c.tier}</Badge></div><div className="mt-2 text-sm text-slate-600">{c.current_software || "Софт не заполнен"}</div></div><div className="text-right text-xs text-slate-400">{stageLabel(c.stage)}<div className="mt-1 font-semibold text-slate-600">{money(c.actual_tco_kzt)}</div></div></div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500"><div>Renewal: <b>{dateLabel(c.renewal_date)}</b></div><div>Оффер: <b>{money(c.proposed_price_kzt)}</b></div><div className="col-span-2 truncate">Next: {c.next_action || "—"}</div></div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {tab === "auction" ? (
          <section>
            <div className="mb-5"><h2 className="text-lg font-bold text-slate-900">Рынок-аукцион</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">Через 5–7 дней разработки получает не «любимый» сегмент, а тот, который доказал спрос разговорами, счетами, demo, данными для миграции и депозитом.</p></div>
            <div className="grid gap-4 xl:grid-cols-2">
              {scores.map((x, index) => (
                <div key={x.segment.id} className={`rounded-2xl border bg-white p-5 shadow-card ${index === 0 ? "border-blue-300" : "border-slate-200"}`}>
                  <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><Badge tone="blue">#{index + 1}</Badge><Badge tone={x.won ? "green" : "slate"}>{x.won ? "Условия победы выполнены" : "Тестируется"}</Badge></div><h3 className="mt-3 text-lg font-bold text-slate-900">{x.segment.code} · {x.segment.name}</h3></div><div className="text-right"><div className="text-3xl font-black text-slate-900">{x.score}</div><div className="text-xs text-slate-400">Auction Score / 100</div></div></div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${x.score}%` }} /></div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <div><span className="text-slate-400">ЛПР-разговоры</span><div className="font-bold">{x.dm} / 10</div></div>
                    <div><span className="text-slate-400">Конкурент подтвержден</span><div className="font-bold">{x.confirmed} / 5</div></div>
                    <div><span className="text-slate-400">Demo</span><div className="font-bold">{x.demos} / 3</div></div>
                    <div><span className="text-slate-400">Данные миграции</span><div className="font-bold">{x.migrations} / 2</div></div>
                    <div><span className="text-slate-400">Депозит</span><div className="font-bold">{x.deposits} / 1</div></div>
                    <div><span className="text-slate-400">TCO доказан</span><div className="font-bold">{money(x.tco)}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "segments" ? (
          <section>
            <div className="mb-5"><h2 className="text-lg font-bold text-slate-900">Сегменты и порядок атаки</h2><p className="mt-1 text-sm text-slate-500">Стартовый приоритет; после аукциона порядок меняется по фактам.</p></div>
            <div className="space-y-4">
              {segments.map((s) => (
                <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><Badge tone="blue">Приоритет #{s.priority}</Badge><h3 className="mt-2 text-lg font-bold text-slate-900">{s.code} · {s.name}</h3><p className="mt-2 text-sm font-medium text-slate-600">{s.software}</p></div><div className="flex gap-2"><Badge>миграция {s.migration_ease}/10</Badge><Badge>разработка {s.build_ease}/10</Badge></div></div>
                  <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-600">{s.thesis}</p>
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600"><b>Ценовой benchmark:</b> {s.benchmark}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        {([
          ["today", "Сегодня", "✓"],
          ["companies", "Компании", "◎"],
          ["auction", "Аукцион", "⚡"],
          ["segments", "Сегменты", "▦"],
        ] as [Tab, string, string][]).map(([key, label, icon]) => <button key={key} type="button" onClick={() => setTab(key)} className={`min-h-12 rounded-xl text-xs font-semibold ${tab === key ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}><div className="text-base">{icon}</div>{label}</button>)}
      </nav>

      {editing ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-2 sm:p-5" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-3xl border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
              <div><div className="flex flex-wrap gap-2"><Badge tone="blue">{segments.find((s) => s.id === editing.segment_id)?.code}</Badge><Badge tone={editing.tier === "A" ? "green" : editing.tier === "B" ? "amber" : "slate"}>Tier {editing.tier}</Badge></div><h2 className="mt-2 text-xl font-bold text-slate-900">{editing.name}</h2></div>
              <button type="button" onClick={() => { setEditing(null); setError(""); }} className="h-10 w-10 rounded-xl bg-slate-100 text-xl text-slate-500">×</button>
            </div>
            <div className="space-y-6 p-4 sm:p-6">
              <div className="rounded-2xl bg-slate-950 p-4 text-white"><div className="text-xs uppercase tracking-wide text-slate-400">Главная задача</div><div className="mt-1 font-semibold">{editing.next_action || "Назначить конкретный следующий шаг"}</div><div className="mt-1 text-sm text-slate-400">{dateLabel(editing.next_action_date)}</div></div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Tier"><select value={editing.tier} onChange={(e) => setEditing({ ...editing, tier: e.target.value as any })} className="input"><option>A</option><option>B</option><option>C</option></select></Field>
                <Field label="Сегмент"><select value={editing.segment_id} onChange={(e) => setEditing({ ...editing, segment_id: e.target.value })} className="input">{segments.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}</select></Field>
                <Field label="Этап"><select value={editing.stage} onChange={(e) => setEditing({ ...editing, stage: e.target.value })} className="input">{FUNNEL_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></Field>
              </div>

              <EditorSection title="1. Доказать действующий софт">
                <div className="grid gap-4 sm:grid-cols-2"><Field label="Текущий софт"><input className="input" value={editing.current_software} onChange={(e) => setEditing({ ...editing, current_software: e.target.value })} /></Field><Field label="Достоверность"><select className="input" value={editing.evidence_confidence} onChange={(e) => setEditing({ ...editing, evidence_confidence: e.target.value as any })}><option value="high">high — прямое подтверждение</option><option value="medium">medium — tech/vacancy signal</option><option value="low">low — гипотеза</option></select></Field></div>
                <Field label="URL доказательства"><input className="input" value={editing.evidence_url} onChange={(e) => setEditing({ ...editing, evidence_url: e.target.value })} /></Field>
                <Field label="Что именно доказано"><textarea className="input min-h-20" value={editing.evidence_note} onChange={(e) => setEditing({ ...editing, evidence_note: e.target.value })} /></Field>
                <Check label="Конкурент подтвержден самим клиентом" checked={editing.competitor_confirmed} onChange={(v) => setEditing({ ...editing, competitor_confirmed: v })} />
              </EditorSection>

              <EditorSection title="2. Найти ЛПР и провести discovery">
                <div className="grid gap-4 sm:grid-cols-2"><Field label="Имя ЛПР"><input className="input" value={editing.decision_maker_name} onChange={(e) => setEditing({ ...editing, decision_maker_name: e.target.value })} /></Field><Field label="Должность"><input className="input" value={editing.decision_maker_role} onChange={(e) => setEditing({ ...editing, decision_maker_role: e.target.value })} /></Field></div>
                <Field label="Телефон / email / LinkedIn"><input className="input" value={editing.decision_maker_contact} onChange={(e) => setEditing({ ...editing, decision_maker_contact: e.target.value })} /></Field>
                <Check label="Проведен живой discovery-разговор с ЛПР" checked={editing.dm_conversation} onChange={(v) => setEditing({ ...editing, dm_conversation: v })} />
                <Field label="Боль / что бесит в текущем решении"><textarea className="input min-h-20" value={editing.pain} onChange={(e) => setEditing({ ...editing, pain: e.target.value })} /></Field>
                <Field label="Must-have: что нельзя потерять при миграции"><textarea className="input min-h-20" value={editing.must_keep} onChange={(e) => setEditing({ ...editing, must_keep: e.target.value })} /></Field>
              </EditorSection>

              <EditorSection title="3. Деньги и renewal">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><NumberField label="Пользователей" value={editing.estimated_users} onChange={(v) => setEditing({ ...editing, estimated_users: v })} /><NumberField label="TCO оценка, ₸" value={editing.estimated_tco_kzt} onChange={(v) => setEditing({ ...editing, estimated_tco_kzt: v })} /><NumberField label="TCO факт, ₸" value={editing.actual_tco_kzt} onChange={(v) => setEditing({ ...editing, actual_tco_kzt: v })} /><Field label="Renewal"><input type="date" className="input" value={editing.renewal_date || ""} onChange={(e) => setEditing({ ...editing, renewal_date: e.target.value || null })} /></Field></div>
                <Check label="Увидели счет / договор / подтверждение цены" checked={editing.invoice_seen} onChange={(v) => setEditing({ ...editing, invoice_seen: v })} />
              </EditorSection>

              <EditorSection title="4. Demo → миграция → предложение">
                <Check label="Клиент согласился посмотреть demo" checked={editing.demo_committed} onChange={(v) => setEditing({ ...editing, demo_committed: v })} />
                <Check label="Клиент готов дать экспорт / данные для тестовой миграции" checked={editing.migration_data_committed} onChange={(v) => setEditing({ ...editing, migration_data_committed: v })} />
                <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Наш оффер, ₸" value={editing.proposed_price_kzt} onChange={(v) => setEditing({ ...editing, proposed_price_kzt: v })} /><NumberField label="Депозит, ₸" value={editing.deposit_kzt} onChange={(v) => setEditing({ ...editing, deposit_kzt: v })} /><NumberField label="WON cash, ₸" value={editing.won_value_kzt} onChange={(v) => setEditing({ ...editing, won_value_kzt: v })} /></div>
                <Check label="Клиент подтвердил готовность внести депозит при выполнении требований" checked={editing.deposit_committed} onChange={(v) => setEditing({ ...editing, deposit_committed: v })} />
              </EditorSection>

              <EditorSection title="5. Следующее действие">
                <Field label="Один конкретный следующий шаг"><input className="input" value={editing.next_action} onChange={(e) => setEditing({ ...editing, next_action: e.target.value })} /></Field>
                <div className="grid gap-4 sm:grid-cols-2"><Field label="Дата"><input type="date" className="input" value={editing.next_action_date || ""} onChange={(e) => setEditing({ ...editing, next_action_date: e.target.value || null })} /></Field><Field label="Почему сейчас"><input className="input" value={editing.why_now} onChange={(e) => setEditing({ ...editing, why_now: e.target.value })} /></Field></div>
                <Field label="Рабочие заметки"><textarea className="input min-h-24" value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></Field>
              </EditorSection>

              <EditorSection title="История касаний">
                <div className="flex gap-2"><input className="input flex-1" value={activityDraft} onChange={(e) => setActivityDraft(e.target.value)} placeholder="Что произошло после звонка/встречи?" /><button type="button" disabled={!activityDraft.trim() || saving} onClick={addActivity} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Добавить</button></div>
                <div className="mt-3 space-y-2">{activities.map((a) => <div key={a.id} className="rounded-xl bg-slate-50 p-3 text-sm"><div className="text-xs text-slate-400">{new Date(a.created_at).toLocaleString("ru-RU")}</div><div className="mt-1 text-slate-700">{a.note}</div></div>)}</div>
              </EditorSection>

              {getStageGate(editing).length ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><b>Гейт текущего этапа:</b><ul className="mt-2 list-disc space-y-1 pl-5">{getStageGate(editing).map((x) => <li key={x}>{x}</li>)}</ul></div> : <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">✓ Фактов достаточно для выбранного этапа.</div>}
            </div>
            <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 rounded-b-3xl border-t border-slate-200 bg-white p-4 sm:px-6"><button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">Закрыть</button><button type="button" disabled={saving} onClick={saveCompany} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Сохраняю…" : "Сохранить карточку"}</button></div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .input { width: 100%; border: 1px solid rgb(226 232 240); border-radius: 0.75rem; padding: 0.65rem 0.8rem; font-size: 0.875rem; color: rgb(30 41 59); background: white; outline: none; }
        .input:focus { border-color: rgb(59 130 246); box-shadow: 0 0 0 3px rgb(219 234 254 / 0.7); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>{children}</label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number | null) => void }) {
  return <Field label={label}><input type="number" min="0" className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Math.max(0, Number(e.target.value)))} /></Field>;
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"><input type="checkbox" className="h-4 w-4" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span>{label}</span></label>;
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-4 rounded-2xl border border-slate-200 p-4"><h3 className="font-bold text-slate-900">{title}</h3>{children}</section>;
}
