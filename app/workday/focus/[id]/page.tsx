import Link from "next/link";
import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import ScoreBadge from "@/components/ScoreBadge";
import TemperatureBadge from "@/components/TemperatureBadge";
import SlaBadge from "@/components/SlaBadge";
import { leads, tenge, actionLabels, triggerLabels } from "@/lib/mock";

export function generateStaticParams() {
  return leads.map((l) => ({ id: l.id }));
}

export default function FocusModePage({ params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound();

  return (
    <>
      <Topbar title="Режим фокуса" subtitle={`${lead.company} · один лид, без распылений`} />
      <div className="p-8 max-w-2xl mx-auto">
        <Link href="/workday" className="text-sm text-brand mb-4 inline-block">← К списку «Мой день»</Link>

        <div className="card p-6 space-y-6">
          {/* Идентичность */}
          <div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-graphite">{lead.company}</h2>
              <ScoreBadge score={lead.score} size="lg" />
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {lead.city}{lead.district ? `, ${lead.district}` : ""} · {lead.category}
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {lead.temperature && <TemperatureBadge temperature={lead.temperature} />}
              {lead.slaStatus && <SlaBadge status={lead.slaStatus} deadlineAt={lead.slaDeadlineAt} showCountdown />}
            </div>
          </div>

          {/* Почему сейчас */}
          <div className="p-4 rounded-lg bg-brand-soft">
            <div className="text-xs font-semibold text-brand uppercase tracking-wide mb-1">Почему именно сейчас</div>
            <div className="text-sm text-graphite font-medium">{triggerLabels[lead.trigger] ?? lead.trigger}</div>
            <p className="text-sm text-slate-600 mt-1">{lead.triggerText}</p>
          </div>

          {/* Рекомендованное действие */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Рекомендованное действие</div>
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-semibold">
              → {actionLabels[lead.action] ?? lead.action}
            </div>
            <div className="text-sm text-slate-500 mt-2">
              Потенциал: <span className="font-semibold text-graphite">{tenge(lead.budgetMin)} – {tenge(lead.budgetMax)}</span>
              {lead.moneyPriorityScore !== undefined && (
                <span className="ml-2">· Money Score: <span className="font-semibold text-graphite">{lead.moneyPriorityScore}</span></span>
              )}
            </div>
          </div>

          {/* Сообщение */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Готовое сообщение WhatsApp</div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{lead.whatsappMessage}</p>
              <button className="mt-3 text-xs text-brand font-medium">⧉ Копировать</button>
            </div>
          </div>

          {/* Действия */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/workday"
              className="flex-1 text-center px-4 py-3 rounded-lg bg-brand text-white font-semibold hover:bg-brand-light transition"
            >
              Готово, следующий лид →
            </Link>
            <button className="px-4 py-3 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">
              Отложить
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
