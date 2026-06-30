import Link from "next/link";
import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import ScoreBadge from "@/components/ScoreBadge";
import TemperatureBadge from "@/components/TemperatureBadge";
import SlaBadge from "@/components/SlaBadge";
import MoneyScoreCard from "@/components/MoneyScoreCard";
import {
  leads, tenge, triggerLabels, actionLabels, statusLabels, doNotContactList,
} from "@/lib/mock";

const breakdownLabels: Record<string, string> = {
  trigger: "Сила триггера", niche: "Денежность ниши", contact: "Способ связи",
  geo: "Гео закрыто пабликами", budget: "Признаки бюджета", freshness: "Свежесть",
  reliability: "Надёжность источника", penalty: "Штраф за мусор",
};
const breakdownMax: Record<string, number> = {
  trigger: 25, niche: 20, contact: 15, geo: 15, budget: 10, freshness: 10, reliability: 5, penalty: 0,
};

export function generateStaticParams() {
  return leads.map((l) => ({ id: l.id }));
}

export default function LeadCard({ params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound();

  const dncMatch = doNotContactList.find(
    (dnc) =>
      (dnc.bin && lead.bin && dnc.bin === lead.bin) ||
      (dnc.phone && lead.contacts.phone && dnc.phone === lead.contacts.phone) ||
      (dnc.phone && lead.contacts.whatsapp && dnc.phone === lead.contacts.whatsapp)
  );

  return (
    <>
      <Topbar title={lead.company} subtitle={`${lead.id} · ${lead.category}`} />
      <div className="p-8">
        <Link href="/leads" className="text-sm text-brand mb-4 inline-block">← К списку лидов</Link>

        {dncMatch && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
            ⚠ Не контактировать: {dncMatch.reason} (добавлено {dncMatch.addedAt})
          </div>
        )}

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {lead.temperature && <TemperatureBadge temperature={lead.temperature} />}
          {lead.slaStatus && <SlaBadge status={lead.slaStatus} deadlineAt={lead.slaDeadlineAt} showCountdown />}
          {lead.isFounderBoosted && (
            <span className="inline-flex items-center gap-1.5 rounded-full ring-1 font-semibold text-xs px-2.5 py-1 bg-amber-50 text-amber-700 ring-amber-200">
              ★ Founder Boost
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Левая колонка — идентификация */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-bold text-graphite mb-4">Компания</h3>
              <dl className="space-y-2.5 text-sm">
                <Row k="Название" v={lead.company} />
                <Row k="БИН" v={lead.bin ?? "—"} />
                <Row k="Ниша" v={lead.category} />
                <Row k="Подниша" v={lead.subcategory ?? "—"} />
              </dl>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-graphite mb-4">Гео</h3>
              <dl className="space-y-2.5 text-sm">
                <Row k="Страна" v="Казахстан" />
                <Row k="Город" v={lead.city} />
                <Row k="Район" v={lead.district ?? "—"} />
                <Row k="Адрес" v={lead.address ?? "—"} />
              </dl>
              <div className="mt-4 h-28 rounded-lg bg-brand-soft grid place-items-center text-brand text-sm">🗺 Карта (демо)</div>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-graphite">Контакты</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  lead.contactConfidence === "high" ? "bg-emerald-50 text-emerald-600" :
                  lead.contactConfidence === "medium" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                  уверенность: {lead.contactConfidence === "high" ? "высокая" : lead.contactConfidence === "medium" ? "средняя" : "низкая"}
                </span>
              </div>
              <dl className="space-y-2.5 text-sm">
                {lead.contacts.whatsapp && <Row k="WhatsApp" v={lead.contacts.whatsapp} />}
                {lead.contacts.phone && <Row k="Телефон" v={lead.contacts.phone} />}
                {lead.contacts.instagram && <Row k="Instagram" v={lead.contacts.instagram} />}
                {lead.contacts.email && <Row k="Email" v={lead.contacts.email} />}
                {lead.contacts.website && <Row k="Сайт" v={lead.contacts.website} />}
              </dl>
              <div className="mt-3 text-xs text-slate-400">Источник контакта: {lead.source}</div>
              {lead.sourceConfidence !== undefined && (
                <div className="mt-1 text-xs text-slate-400">
                  Источник: надёжность {Math.round(lead.sourceConfidence * 100)}%
                </div>
              )}
            </div>
          </div>

          {/* Центральная колонка — сигнал и анализ */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-bold text-graphite mb-4">Сигнал</h3>
              <dl className="space-y-2.5 text-sm">
                <Row k="Источник" v={lead.source} />
                <Row k="Ссылка" v={lead.sourceUrl ?? "—"} link />
                <Row k="Дата" v={lead.signalDate} />
                <Row k="Тип триггера" v={triggerLabels[lead.trigger] ?? lead.trigger} />
              </dl>
              <div className="mt-3 p-3 rounded-lg bg-slate-50 text-sm text-slate-600">{lead.triggerText}</div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-graphite">Priority Score</h3>
                <ScoreBadge score={lead.score} size="lg" />
              </div>
              <div className="space-y-2">
                {Object.entries(lead.scoreBreakdown).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-500">{breakdownLabels[k]}</span>
                      <span className="font-medium text-graphite">{v}{breakdownMax[k] ? ` / ${breakdownMax[k]}` : ""}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${v < 0 ? "bg-red-400" : "bg-brand"}`}
                        style={{ width: `${Math.min(100, Math.abs(v) / (breakdownMax[k] || 25) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-brand-soft text-sm text-graphite">{lead.scoreExplanation}</div>
            </div>

            <MoneyScoreCard
              moneyPriorityScore={lead.moneyPriorityScore}
              dealProbability={lead.dealProbability}
              potentialDealSize={lead.potentialDealSize}
              expectedMargin={lead.expectedMargin}
            />

            <div className="card p-6">
              <h3 className="font-bold text-graphite mb-4">AI-рекомендация</h3>
              <dl className="space-y-2.5 text-sm">
                <Row k="Потенциальный бюджет" v={`${tenge(lead.budgetMin)} – ${tenge(lead.budgetMax)}`} />
                <Row k="Рекомендованный пакет" v={lead.package} />
                <Row k="Гео размещения" v={lead.recommendedGeo} />
                <Row k="Формат" v={lead.recommendedFormat} />
              </dl>
            </div>
          </div>

          {/* Правая колонка — действия и коммуникация */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-bold text-graphite mb-4">Рекомендованное действие</h3>
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-semibold mb-4">
                → {actionLabels[lead.action] ?? lead.action}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["Написать WhatsApp", "Позвонить", "Отправить КП", "Собрать подборку", "Follow-up", "Назначить"].map((b) => (
                  <button key={b} className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">{b}</button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-graphite">Первое WhatsApp-сообщение</h3>
                <button className="text-xs text-brand font-medium">⟳ Сгенерировать</button>
              </div>
              <Message text={lead.whatsappMessage} />
              <details className="mt-3">
                <summary className="text-sm text-brand cursor-pointer">Follow-up 1 день / 3 дня</summary>
                <div className="mt-2 space-y-2">
                  <Message text={lead.followUp1d} label="через 1 день" />
                  <Message text={lead.followUp3d} label="через 3 дня" />
                </div>
              </details>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-graphite mb-4">Сделка</h3>
              <dl className="space-y-2.5 text-sm">
                <Row k="Статус" v={statusLabels[lead.status] ?? lead.status} />
                <Row k="Менеджер" v={lead.manager ?? "не назначен"} />
                <Row k="Следующий контакт" v="—" />
              </dl>
              <div className="mt-4">
                <div className="text-xs text-slate-400 mb-2">История действий</div>
                <ol className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-brand">●</span><span className="text-slate-600">Сигнал получен из «{lead.source}» · {lead.signalDate}</span></li>
                  <li className="flex gap-2"><span className="text-brand">●</span><span className="text-slate-600">AI-анализ выполнен · score {lead.score}</span></li>
                  <li className="flex gap-2"><span className="text-slate-300">○</span><span className="text-slate-400">Ожидает действия менеджера</span></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ k, v, link }: { k: string; v: string; link?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-400 shrink-0">{k}</dt>
      <dd className={`text-right ${link ? "text-brand truncate max-w-[60%]" : "text-graphite"}`}>{v}</dd>
    </div>
  );
}

function Message({ text, label }: { text: string; label?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      {label && <div className="text-[11px] text-slate-400 mb-1">{label}</div>}
      <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
      <button className="mt-2 text-xs text-brand font-medium">⧉ Копировать</button>
    </div>
  );
}
