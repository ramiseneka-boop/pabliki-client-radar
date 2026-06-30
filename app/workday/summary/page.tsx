import Link from "next/link";
import Topbar from "@/components/Topbar";
import MetricCard from "@/components/MetricCard";
import TemperatureBadge from "@/components/TemperatureBadge";
import SlaBadge from "@/components/SlaBadge";
import { leads, tenge, actionLabels } from "@/lib/mock";

export default function WorkdaySummaryPage() {
  const contacted = leads.filter((l) => l.status !== "new").slice(0, 5);
  const movedForward = leads.filter((l) =>
    ["written", "replied", "proposal_sent", "negotiation", "payment"].includes(l.status)
  );
  const moneyAddedToday = movedForward.reduce((sum, l) => sum + (l.moneyPriorityScore ?? 0), 0);

  const willBeOverdueTomorrow = leads.filter((l) => l.slaStatus === "warning");

  // Мок-сравнение с "вчера"
  const yesterday = {
    contacted: Math.max(0, contacted.length - 2),
    moneyAdded: Math.round(moneyAddedToday * 0.78),
    dealsMovedForward: Math.max(0, movedForward.length - 1),
  };

  function delta(today: number, yest: number): string {
    const diff = today - yest;
    if (diff === 0) return "без изменений к вчера";
    return diff > 0 ? `+${diff} к вчера` : `${diff} к вчера`;
  }

  return (
    <>
      <Topbar title="Итоги дня" subtitle="Сводка активности менеджера за сегодня" />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label="Лидов охвачено"
            value={String(contacted.length)}
            hint={delta(contacted.length, yesterday.contacted)}
            accent
          />
          <MetricCard
            label="Сделок продвинуто"
            value={String(movedForward.length)}
            hint={delta(movedForward.length, yesterday.dealsMovedForward)}
          />
          <MetricCard
            label="Денежный пайплайн добавлен"
            value={tenge(moneyAddedToday)}
            hint={delta(moneyAddedToday, yesterday.moneyAdded) + " (Money Score)"}
          />
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-graphite">Лиды, с которыми был контакт сегодня</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {contacted.map((l) => (
              <Link
                key={l.id}
                href={`/leads/${l.id}`}
                className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-graphite">{l.company}</div>
                  <div className="text-xs text-slate-400">{l.city} · {actionLabels[l.action] ?? l.action}</div>
                </div>
                {l.temperature && <TemperatureBadge temperature={l.temperature} size="sm" />}
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 shrink-0">{l.status}</span>
              </Link>
            ))}
            {contacted.length === 0 && (
              <div className="px-6 py-6 text-sm text-slate-400">Сегодня контактов с лидами ещё не было.</div>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-graphite">Завтра уйдут в просрочку, если не обработать сегодня</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {willBeOverdueTomorrow.map((l) => (
              <Link
                key={l.id}
                href={`/leads/${l.id}`}
                className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-graphite">{l.company}</div>
                  <div className="text-xs text-slate-400">{l.city}</div>
                </div>
                {l.slaStatus && <SlaBadge status={l.slaStatus} size="sm" />}
              </Link>
            ))}
            {willBeOverdueTomorrow.length === 0 && (
              <div className="px-6 py-6 text-sm text-slate-400">Риска просрочки на завтра нет — отличная работа!</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
