"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  addAuctionActivity,
  AuctionCompany,
  AuctionSegment,
  AuctionSession,
  getAuctionSession,
  loadAuctionData,
  updateAuctionCompany,
} from "@/lib/softwareAuctionApi";

type OutreachCompany = AuctionCompany & {
  source?: string;
  source_key?: string | null;
  contact_phone?: string;
  contact_email?: string;
  contact_role?: string;
  priority_score?: number | null;
  priority_reason?: string;
  industry_hint?: string;
  first_message?: string;
  followup_message?: string;
  outreach_status?: string;
  last_contact_at?: string | null;
};

type ViewMode = "today" | "all" | "followup" | "replied";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function cleanPhone(phone: string | undefined) {
  return String(phone || "").replace(/\D/g, "");
}

function firstName(full: string | undefined) {
  return String(full || "").trim().split(/\s+/)[0] || "";
}

function segmentCopy(code: string) {
  const map: Record<string, { area: string; category: string; examples: string }> = {
    ATS: { area: "подбору и найму", category: "ATS / системе подбора", examples: "Huntflow, Potok, Talantix" },
    LMS: { area: "обучению сотрудников", category: "корпоративному LMS", examples: "iSpring, SOHO LMS, Teachbase" },
    CX: { area: "обращениям клиентов и контакт-центру", category: "helpdesk / омниканальному CX", examples: "Zendesk, Usedesk, Omnidesk" },
    CDP: { area: "CRM-маркетингу и удержанию клиентов", category: "CDP / marketing automation", examples: "Mindbox, Carrot quest или аналог" },
  };
  return map[code] || map.ATS;
}

function brandName(name: string) {
  return name.split("/")[0].split(",")[0].trim();
}

function defaultMessage(company: OutreachCompany, segmentCode: string, followup = false) {
  const name = firstName(company.decision_maker_name);
  const hello = name ? `Здравствуйте, ${name}!` : "Здравствуйте!";
  const { area, category, examples } = segmentCopy(segmentCode);
  const brand = brandName(company.name);
  if (followup) {
    return `${hello} Подниму сообщение один раз. Если ${area} не ваша зона — просто подскажите, кому лучше написать. Если ваша, мне достаточно 3 вещей: какая система сейчас, сколько пользователей/сотрудников и когда продление. По ним быстро поймем, есть ли вообще смысл что-то менять.`;
  }
  if ((company.contact_role || "").toLowerCase().includes("влияет")) {
    return `${hello} Рами. Подскажите, пожалуйста, кто в ${brand} отвечает за ${area}? Мы сейчас в Казахстане проверяем модель замены дорогого ${category}: сначала считаем текущий TCO, затем показываем вариант с бесплатной миграцией и параллельным запуском. Если у вас уже есть ${examples}, хочу задать ответственному 3 коротких вопроса. Не хочу слать презентацию не тому человеку.`;
  }
  return `${hello} Рами. Короткий вопрос по ${area} в ${brand}. Мы сейчас проверяем модель локальной альтернативы дорогому ${category}: берем текущий TCO, сохраняем критичные процессы, делаем бесплатную миграцию и 30 дней параллельной работы. Цель — понять, можно ли снизить подтвержденную стоимость примерно на 40–50%. У вас сейчас используется ${examples} или другая отдельная система?`;
}

function tierClass(tier: string) {
  if (tier === "A") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (tier === "B") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function statusLabel(status: string | undefined) {
  const map: Record<string, string> = {
    new: "Новый",
    sent: "WA отправлен",
    replied: "Ответил",
    followup_sent: "Follow-up отправлен",
    not_interested: "Неинтересно",
  };
  return map[status || "new"] || status || "Новый";
}

export default function OutreachBaseApp() {
  const [session, setSession] = useState<AuctionSession | null>(null);
  const [segments, setSegments] = useState<AuctionSegment[]>([]);
  const [companies, setCompanies] = useState<OutreachCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("all");
  const [segment, setSegment] = useState("all");
  const [view, setView] = useState<ViewMode>("today");
  const [visible, setVisible] = useState(60);
  const [busyId, setBusyId] = useState("");
  const [copiedId, setCopiedId] = useState("");

  async function reload(s: AuctionSession) {
    const data = await loadAuctionData(s);
    setSegments(data.segments);
    setCompanies((data.companies as OutreachCompany[]).filter((c) => c.source === "my_base"));
  }

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const s = await getAuctionSession();
        if (!live) return;
        setSession(s);
        if (s) await reload(s);
      } catch (e: any) {
        if (live) setError(e?.message || "Не удалось загрузить базу");
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const segmentById = useMemo(() => new Map(segments.map((s) => [s.id, s.code])), [segments]);
  const today = todayISO();

  const stats = useMemo(() => {
    const due = companies.filter((c) => c.next_action_date && c.next_action_date <= today && !["won", "lost"].includes(c.stage)).length;
    return {
      total: companies.length,
      a: companies.filter((c) => c.tier === "A").length,
      b: companies.filter((c) => c.tier === "B").length,
      due,
      sent: companies.filter((c) => ["sent", "followup_sent"].includes(c.outreach_status || "")).length,
      replied: companies.filter((c) => c.outreach_status === "replied" || c.dm_conversation).length,
    };
  }, [companies, today]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies
      .filter((c) => {
        if (tier !== "all" && c.tier !== tier) return false;
        if (segment !== "all" && c.segment_id !== segment) return false;
        if (view === "today" && !(c.next_action_date && c.next_action_date <= today && !["won", "lost"].includes(c.stage))) return false;
        if (view === "followup" && !(c.outreach_status === "sent" && c.next_action_date && c.next_action_date <= today)) return false;
        if (view === "replied" && !(c.outreach_status === "replied" || c.dm_conversation)) return false;
        if (q) {
          const hay = `${c.name} ${c.decision_maker_name} ${c.decision_maker_role} ${c.contact_phone} ${c.contact_email} ${c.industry_hint}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const ad = a.next_action_date || "9999-12-31";
        const bd = b.next_action_date || "9999-12-31";
        if (view === "today" && ad !== bd) return ad.localeCompare(bd);
        if (a.tier !== b.tier) return a.tier.localeCompare(b.tier);
        return Number(b.priority_score || 0) - Number(a.priority_score || 0);
      });
  }, [companies, search, tier, segment, view, today]);

  async function patch(company: OutreachCompany, values: Record<string, unknown>, activity?: string) {
    if (!session) return;
    setBusyId(company.id);
    setError("");
    try {
      const updated = await updateAuctionCompany(session, company.id, values as any);
      const saved = updated[0] as OutreachCompany | undefined;
      if (saved) setCompanies((old) => old.map((c) => (c.id === saved.id ? saved : c)));
      if (activity) await addAuctionActivity(session, company.id, activity, "outreach");
    } catch (e: any) {
      setError(e?.message || "Не удалось обновить карточку");
    } finally {
      setBusyId("");
    }
  }

  async function markSent(company: OutreachCompany, followup = false) {
    await patch(
      company,
      {
        stage: company.stage === "research" || company.stage === "lpr_found" ? "contacted" : company.stage,
        outreach_status: followup ? "followup_sent" : "sent",
        last_contact_at: new Date().toISOString(),
        next_action: followup ? "Позвонить / закрыть цикл, если нет ответа" : "Follow-up WhatsApp, если нет ответа",
        next_action_date: addDaysISO(followup ? 5 : 2),
      },
      followup ? "Follow-up WhatsApp отправлен" : "Первое сообщение WhatsApp отправлено"
    );
  }

  async function markReplied(company: OutreachCompany) {
    await patch(
      company,
      {
        stage: "discovery",
        outreach_status: "replied",
        dm_conversation: true,
        next_action: "Discovery: текущая система, пользователи, TCO, renewal, боль и must-have",
        next_action_date: todayISO(),
      },
      "Получен ответ — переведено в Discovery"
    );
  }

  async function markLost(company: OutreachCompany) {
    await patch(
      company,
      { stage: "lost", outreach_status: "not_interested", lost_reason: "Неинтересно / нет релевантного процесса" },
      "Закрыто как неинтересно"
    );
  }

  async function copyMessage(company: OutreachCompany, followup = false) {
    const code = segmentById.get(company.segment_id) || "ATS";
    const text = followup ? company.followup_message || defaultMessage(company, code, true) : company.first_message || defaultMessage(company, code);
    await navigator.clipboard.writeText(text);
    setCopiedId(company.id + (followup ? "-f" : ""));
    window.setTimeout(() => setCopiedId(""), 1500);
  }

  function whatsappHref(company: OutreachCompany, followup = false) {
    const phone = cleanPhone(company.contact_phone || company.decision_maker_contact);
    const code = segmentById.get(company.segment_id) || "ATS";
    const text = followup ? company.followup_message || defaultMessage(company, code, true) : company.first_message || defaultMessage(company, code);
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  if (loading) return <div className="p-8 text-sm text-slate-500">Загружаю базу…</div>;
  if (!session) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <h1 className="text-2xl font-bold text-slate-900">Моя база</h1>
        <p className="mt-3 text-slate-600">Сначала войди в Auction CRM, затем этот экран подхватит твою сессию.</p>
        <Link href="/auction" className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">Войти в CRM</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500"><Link href="/auction" className="hover:text-slate-900">Software Auction</Link><span>›</span><span>Моя база</span></div>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Моя база · WhatsApp outreach</h1>
            <p className="mt-1 text-sm text-slate-500">Иди сверху вниз: A → B. Цель первого касания — не продавать, а подтвердить систему, TCO и дату продления.</p>
          </div>
          <Link href="/auction/playbook" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Playbook</Link>
        </div>

        {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[["Всего", stats.total], ["A", stats.a], ["B", stats.b], ["Сегодня", stats.due], ["WA отправлено", stats.sent], ["Ответили", stats.replied]].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
              <div className="mt-1 text-2xl font-black text-slate-900">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto_auto]">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setVisible(60); }} placeholder="Поиск: компания, ЛПР, телефон…" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            <select value={tier} onChange={(e) => { setTier(e.target.value); setVisible(60); }} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="all">A + B</option><option value="A">Только A</option><option value="B">Только B</option></select>
            <select value={segment} onChange={(e) => { setSegment(e.target.value); setVisible(60); }} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="all">Все сегменты</option>{segments.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}</select>
            <select value={view} onChange={(e) => { setView(e.target.value as ViewMode); setVisible(60); }} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="today">Кого писать сегодня</option><option value="all">Вся база</option><option value="followup">Follow-up сегодня</option><option value="replied">Ответили</option></select>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-500">Показано {Math.min(rows.length, visible)} из {rows.length}</div>
        <div className="mt-3 space-y-3">
          {rows.slice(0, visible).map((company) => {
            const code = segmentById.get(company.segment_id) || "—";
            const followupDue = company.outreach_status === "sent" && company.next_action_date && company.next_action_date <= today;
            const message = followupDue ? company.followup_message || defaultMessage(company, code, true) : company.first_message || defaultMessage(company, code);
            return (
              <article key={company.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${tierClass(company.tier)}`}>{company.tier}</span>
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">{code}</span>
                      <span className="text-xs font-bold text-slate-500">Score {company.priority_score || 0}</span>
                      <span className="text-xs text-slate-400">{statusLabel(company.outreach_status)}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-black text-slate-900">{company.name}</h2>
                    {company.industry_hint ? <div className="mt-1 text-xs text-slate-500">{company.industry_hint}</div> : null}
                  </div>
                  <div className="text-right text-xs text-slate-400">Следующий шаг<br/><b className="text-slate-700">{company.next_action_date || "—"}</b></div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[280px_1fr]">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Контакт</div>
                    <div className="mt-1 font-bold text-slate-900">{company.decision_maker_name || "Без имени"}</div>
                    <div className="text-sm text-slate-600">{company.decision_maker_role || company.contact_role || "—"}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{company.contact_phone || company.decision_maker_contact}</div>
                    {company.contact_email ? <div className="mt-1 break-all text-xs text-slate-500">{company.contact_email}</div> : null}
                    <div className="mt-2 text-xs text-slate-500">{company.contact_role || "Контакт"}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{followupDue ? "Follow-up" : "Первое сообщение"}</div>
                    <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">{message}</div>
                    {company.priority_reason ? <div className="mt-2 text-xs text-slate-500"><b>Почему приоритет:</b> {company.priority_reason}</div> : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={whatsappHref(company, !!followupDue)} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700">WhatsApp</a>
                  <button onClick={() => copyMessage(company, !!followupDue)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">{copiedId === company.id + (followupDue ? "-f" : "") ? "Скопировано ✓" : "Копировать текст"}</button>
                  <button disabled={busyId === company.id} onClick={() => markSent(company, !!followupDue)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{followupDue ? "Follow-up отправлен" : "WA отправлено"}</button>
                  <button disabled={busyId === company.id} onClick={() => markReplied(company)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Ответил → Discovery</button>
                  <button disabled={busyId === company.id} onClick={() => markLost(company)} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50">Неинтересно</button>
                </div>
              </article>
            );
          })}
        </div>

        {rows.length > visible ? <button onClick={() => setVisible((v) => v + 60)} className="mt-5 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700">Показать еще 60</button> : null}
        {!rows.length ? <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">По этому фильтру компаний нет.</div> : null}
      </div>
    </div>
  );
}
