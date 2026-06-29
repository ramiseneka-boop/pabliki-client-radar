import Link from "next/link";
import Topbar from "@/components/Topbar";
import MetricCard from "@/components/MetricCard";
import ScoreBadge from "@/components/ScoreBadge";
import { BarList, Donut, Funnel } from "@/components/Charts";
import {
  dashboardMetrics, leads, topNiches, topCities, sourcesBreakdown, funnel,
  tasksToday, tenge, triggerLabels, actionLabels, priorityOf, priorityMeta,
} from "@/lib/mock";

export default function Dashboard() {
  const top = [...leads].sort((a, b) => b.score - a.score).slice(0, 4);
  return (
    <>
      <Topbar title="Dashboard" subtitle="Понедельник, 29 июня 2026 · что важно сегодня" />
      <div className="p-8 space-y-6">
        {/* Метрики */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard label="Найдено сигналов сегодня" value={String(dashboardMetrics.signalsToday)} />
          <MetricCard label="Создано лидов сегодня" value={String(dashboardMetrics.leadsToday)} />
          <MetricCard label="Горячих лидов" value={String(dashboardMetrics.hotLeads)} accent />
          <MetricCard label="Потенциальный оборот" value={tenge(dashboardMetrics.potentialTurnover)} />
          <MetricCard label="Нужно обработать сегодня" value={String(dashboardMetrics.toHandleToday)} hint="задачи менеджеров" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Топ лиды */}
          <div className="xl:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-graphite">Топ лиды по приоритету</h2>
              <Link href="/leads" className="text-sm text-brand font-medium">Все лиды →</Link>
            </div>
            <div className="space-y-3">
              {top.map((l) => {
                const meta = priorityMeta[priorityOf(l.score)];
                return (
                  <Link key={l.id} href={`/leads/${l.id}`}
                    className={`flex items-center gap-4 p-3 rounded-xl border border-slate-100 border-l-4 ${meta.row} hover:bg-slate-50 transition`}>
                    <ScoreBadge score={l.score} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-graphite truncate">{l.company}</div>
                      <div className="text-sm text-slate-500 truncate">
                        {l.city} · {l.category} · {triggerLabels[l.trigger] ?? l.trigger}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-graphite">{tenge(l.budgetMax)}</div>
                      <div className="text-xs text-brand">{actionLabels[l.action] ?? l.action}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Задачи на сегодня */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-graphite">Задачи на сегодня</h2>
              <Link href="/tasks" className="text-sm text-brand font-medium">Все →</Link>
            </div>
            <div className="space-y-2.5">
              {tasksToday.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50">
                  <span className={`w-2 h-2 rounded-full ${priorityMeta[t.priority as "hot" | "warm"].dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-graphite truncate">{t.lead}</div>
                    <div className="text-xs text-slate-400">{actionLabels[t.type]} · {t.manager}</div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{t.due}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Аналитика */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h2 className="font-bold text-graphite mb-4">Топ ниш по спросу</h2>
            <BarList data={topNiches} />
          </div>
          <div className="card p-6">
            <h2 className="font-bold text-graphite mb-4">Топ городов по спросу</h2>
            <BarList data={topCities} />
          </div>
          <div className="card p-6">
            <h2 className="font-bold text-graphite mb-4">Источники лидов</h2>
            <Donut data={sourcesBreakdown} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-graphite mb-4">Конверсия по статусам</h2>
          <Funnel data={funnel} />
        </div>
      </div>
    </>
  );
}
