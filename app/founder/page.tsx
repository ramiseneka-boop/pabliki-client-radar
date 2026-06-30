import Link from "next/link";
import Topbar from "@/components/Topbar";
import MetricCard from "@/components/MetricCard";
import ScoreBadge from "@/components/ScoreBadge";
import { BarList } from "@/components/Charts";
import { leads, tenge, founderControlCenterStats, managerCoachingStats } from "@/lib/mock";

export default function FounderControlCenterPage() {
  const stats = founderControlCenterStats;
  const topMoneyLeads = stats.topMoneyPriorityLeadIds
    .map((id) => leads.find((l) => l.id === id))
    .filter(Boolean) as typeof leads;

  const slaRiskLeads = leads.filter((l) => l.slaStatus === "warning" || l.slaStatus === "overdue");
  const boostedLeads = leads.filter((l) => l.isFounderBoosted);
  const boostCandidates = leads.filter((l) => !l.isFounderBoosted).slice(0, 5);

  const leaderboardChart = managerCoachingStats.map((m) => ({ name: m.manager, value: Math.round(m.conversionRate * 100) }));

  return (
    <>
      <Topbar title="Founder Control Center" subtitle="Обзор бизнеса для основателя агентства" />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Горячих лидов сегодня" value={String(stats.hotLeadsToday)} accent />
          <MetricCard label="Лидов под риском SLA" value={String(stats.leadsAtSlaRisk)} />
          <MetricCard label="Денежный пайплайн (Money Score)" value={tenge(stats.moneyPipelineTotal)} />
          <MetricCard label="Founder Boost активен" value={String(boostedLeads.length)} hint="лидов с приоритетом основателя" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Manager leaderboard */}
          <div className="xl:col-span-2 card p-6">
            <h2 className="font-bold text-graphite mb-4">Лидерборд менеджеров</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="py-2 font-medium">Менеджер</th>
                  <th className="py-2 font-medium">Среднее время ответа</th>
                  <th className="py-2 font-medium">Конверсия</th>
                  <th className="py-2 font-medium">Обработано лидов</th>
                  <th className="py-2 font-medium">Vs команда</th>
                </tr>
              </thead>
              <tbody>
                {managerCoachingStats.map((m) => (
                  <tr key={m.manager} className="border-b border-slate-50">
                    <td className="py-2.5 font-semibold text-graphite">{m.manager}</td>
                    <td className="py-2.5 text-slate-600">{m.avgResponseTimeMinutes} мин</td>
                    <td className="py-2.5 text-slate-600">{Math.round(m.conversionRate * 100)}%</td>
                    <td className="py-2.5 text-slate-600">{m.leadsHandled}</td>
                    <td className={`py-2.5 font-medium ${m.scoreVsTeamAvg >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {m.scoreVsTeamAvg >= 0 ? "+" : ""}{m.scoreVsTeamAvg}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-graphite mb-4">Конверсия по менеджерам</h2>
            <BarList data={leaderboardChart} unit="%" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Top money leads */}
          <div className="card p-6">
            <h2 className="font-bold text-graphite mb-4">Топ лиды по денежному приоритету</h2>
            <div className="space-y-2.5">
              {topMoneyLeads.map((l) => (
                <Link key={l.id} href={`/leads/${l.id}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50">
                  <ScoreBadge score={l.score} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-graphite truncate">{l.company}</div>
                    <div className="text-xs text-slate-400">{l.city}</div>
                  </div>
                  <div className="text-sm font-semibold text-brand shrink-0">{l.moneyPriorityScore}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* SLA risk */}
          <div className="card p-6">
            <h2 className="font-bold text-graphite mb-4">Лиды под риском SLA</h2>
            <div className="space-y-2.5">
              {slaRiskLeads.map((l) => (
                <Link key={l.id} href={`/leads/${l.id}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-graphite truncate">{l.company}</div>
                    <div className="text-xs text-slate-400">{l.city}</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ring-1 shrink-0 ${
                      l.slaStatus === "overdue"
                        ? "bg-red-50 text-red-600 ring-red-200"
                        : "bg-amber-50 text-amber-600 ring-amber-200"
                    }`}
                  >
                    {l.slaStatus === "overdue" ? "просрочено" : "скоро просрочка"}
                  </span>
                </Link>
              ))}
              {slaRiskLeads.length === 0 && <div className="text-sm text-slate-400">Риска нет.</div>}
            </div>
          </div>
        </div>

        {/* Founder Priority Boost */}
        <div className="card p-6">
          <h2 className="font-bold text-graphite mb-1">Founder Priority Boost</h2>
          <p className="text-sm text-slate-500 mb-4">
            Лиды, отмеченные основателем как приоритетные вручную. Переключатель здесь только визуальный — изменения не сохраняются.
          </p>
          <div className="space-y-2">
            {boostedLeads.map((l) => (
              <div key={l.id} className="flex items-center gap-3 p-3 rounded-lg bg-brand-soft">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-graphite">{l.company}</div>
                  <div className="text-xs text-slate-500">{l.city} · {l.category}</div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold shrink-0">
                  ★ Boost активен
                </button>
              </div>
            ))}
            {boostCandidates.map((l) => (
              <div key={l.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-graphite">{l.company}</div>
                  <div className="text-xs text-slate-400">{l.city} · {l.category}</div>
                </div>
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium shrink-0 hover:bg-slate-50">
                  ☆ Включить boost
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
