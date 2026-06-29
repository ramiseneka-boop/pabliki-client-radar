import Topbar from "@/components/Topbar";
import MetricCard from "@/components/MetricCard";
import { BarList, Donut, Funnel } from "@/components/Charts";
import { topNiches, topCities, sourcesBreakdown, funnel, tenge } from "@/lib/mock";

export default function AnalyticsPage() {
  return (
    <>
      <Topbar title="Аналитика" subtitle="Лиды, ниши, города, источники, менеджеры" />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Лидов за 30 дней" value="1 248" />
          <MetricCard label="Средний score" value="71" />
          <MetricCard label="Конверсия в оплату" value="4.5%" accent />
          <MetricCard label="Реализованный оборот" value={tenge(8400000)} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6"><h2 className="font-bold text-graphite mb-4">Спрос по нишам</h2><BarList data={topNiches} /></div>
          <div className="card p-6"><h2 className="font-bold text-graphite mb-4">Спрос по города</h2><BarList data={topCities} /></div>
          <div className="card p-6"><h2 className="font-bold text-graphite mb-4">Эфдективность источников</h2><Donut data={sourcesBreakdown} /></div>
          <div className="card p-6"><h2 className="font-bold text-graphite mb-4">Воронка �о статусам</h2><Funnel data={funnel} /></div>
        </div>
        <div className="card p-6">
          <h2 className="font-bold text-graphite mb-4">Эффективность менеджеров</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="py-2 font-medium">Менеджер</th><th className="py-2 font-medium">Лиды</th>
              <th className="py-2 font-medium">КП</th><th className="py-2 font-medium">Оплаты</th><th className="py-2 font-medium">Конверсия</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-slate-50"><td className="py-2 font-medium">Айгерим</td><td>312</td><td>58</td><td>9</td><td className="text-emerald-600">2.9%</td></tr>
              <tr className="border-b border-slate-50"><td className="py-2 font-medium">Дамир</td><td>287</td><td>49</td><td>7</td><td className="text-emerald-600">2.4%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
