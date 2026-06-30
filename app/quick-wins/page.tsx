import Link from "next/link";
import Topbar from "@/components/Topbar";
import ScoreBadge from "@/components/ScoreBadge";
import TemperatureBadge from "@/components/TemperatureBadge";
import SlaBadge from "@/components/SlaBadge";
import { getQuickWinQueue, tenge, actionLabels } from "@/lib/mock";

export default function QuickWinsPage() {
  const queue = [...getQuickWinQueue()].sort((a, b) => (b.moneyPriorityScore ?? 0) - (a.moneyPriorityScore ?? 0));

  return (
    <>
      <Topbar
        title="Quick Win Queue"
        subtitle={`${queue.length} лидов · горячие/тёплые, SLA в норме, высокая вероятность сделки`}
      />
      <div className="p-8">
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Компания</th>
                <th className="px-4 py-3 font-medium">Температура</th>
                <th className="px-4 py-3 font-medium">SLA</th>
                <th className="px-4 py-3 font-medium">Money Score</th>
                <th className="px-4 py-3 font-medium">Рекомендованное действие</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {queue.map((l) => (
                <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-4 py-3"><ScoreBadge score={l.score} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/leads/${l.id}`} className="font-semibold text-graphite hover:text-brand">{l.company}</Link>
                    <div className="text-xs text-slate-400">{l.city}</div>
                  </td>
                  <td className="px-4 py-3">{l.temperature && <TemperatureBadge temperature={l.temperature} size="sm" />}</td>
                  <td className="px-4 py-3">{l.slaStatus && <SlaBadge status={l.slaStatus} size="sm" />}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{l.moneyPriorityScore ?? "—"}</td>
                  <td className="px-4 py-3 text-brand font-medium">{actionLabels[l.action] ?? l.action}</td>
                  <td className="px-4 py-3">
                    <Link href={`/leads/${l.id}`} className="text-xs text-brand font-semibold whitespace-nowrap">
                      Карточка →
                    </Link>
                  </td>
                </tr>
              ))}
              {queue.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Сейчас нет лидов в очереди быстрых побед.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
