import Link from "next/link";
import Topbar from "@/components/Topbar";
import MetricCard from "@/components/MetricCard";
import ScoreBadge from "@/components/ScoreBadge";
import TemperatureBadge from "@/components/TemperatureBadge";
import SlaBadge from "@/components/SlaBadge";
import { leads, tenge, actionLabels, triggerLabels } from "@/lib/mock";

function nextBestAction(lead: (typeof leads)[number]): string {
  if (lead.slaStatus === "overdue") return `Срочно: ${actionLabels[lead.action] ?? lead.action} — SLA уже просрочен`;
  if (lead.temperature === "hot") return `${actionLabels[lead.action] ?? lead.action} — лид горячий, не дать остыть`;
  if (lead.slaStatus === "warning") return `${actionLabels[lead.action] ?? lead.action} — дедлайн SLA приближается`;
  return actionLabels[lead.action] ?? lead.action;
}

function urgencyRank(lead: (typeof leads)[number]): number {
  let rank = 0;
  if (lead.slaStatus === "overdue") rank += 1000;
  else if (lead.slaStatus === "warning") rank += 500;
  if (lead.temperature === "hot") rank += 300;
  else if (lead.temperature === "warming") rank += 150;
  rank += lead.moneyPriorityScore ?? 0;
  return rank;
}

export default function WorkdayPage() {
  const queue = [...leads].sort((a, b) => urgencyRank(b) - urgencyRank(a));

  const hotCount = leads.filter((l) => l.temperature === "hot").length;
  const overdueCount = leads.filter((l) => l.slaStatus === "overdue").length;
  const moneyPipelineToday = leads.reduce((sum, l) => sum + (l.moneyPriorityScore ?? 0), 0);

  return (
    <>
      <Topbar title="Мой день" subtitle="Приоритизированный список задач менеджера на сегодня" />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard label="Горячих лидов" value={String(hotCount)} accent />
          <MetricCard label="Просрочено по SLA" value={String(overdueCount)} />
          <MetricCard label="Денежный пайплайн (сумма Money Score)" value={tenge(moneyPipelineToday)} />
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-graphite">Очередь на сегодня</h2>
            <span className="text-sm text-slate-400">{queue.length} лидов · сортировка: просрочка → горячие → деньги</span>
          </div>
          <div className="divide-y divide-slate-50">
            {queue.map((l) => (
              <div key={l.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60">
                <ScoreBadge score={l.score} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-graphite">{l.company}</span>
                    {l.temperature && <TemperatureBadge temperature={l.temperature} size="sm" />}
                    {l.slaStatus && <SlaBadge status={l.slaStatus} size="sm" />}
                  </div>
                  <div className="text-sm text-slate-500 truncate mt-0.5">
                    {l.city} · {triggerLabels[l.trigger] ?? l.trigger}
                  </div>
                  <div className="text-sm text-brand font-medium mt-1">{nextBestAction(l)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400">Money Score</div>
                  <div className="font-semibold text-graphite">{l.moneyPriorityScore ?? "—"}</div>
                </div>
                <Link
                  href={`/workday/focus/${l.id}`}
                  className="shrink-0 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-light transition"
                >
                  Начать →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
