import Topbar from "@/components/Topbar";
import { leads, triggerLabels } from "@/lib/mock";

const statusPill: Record<string, string> = {
  processed: "bg-emerald-50 text-emerald-600",
  new: "bg-sky-50 text-sky-600",
  needs_review: "bg-amber-50 text-amber-600",
  duplicate: "bg-slate-100 text-slate-500",
};

export default function SignalsPage() {
  const signals = leads.map((l, i) => ({
    id: `S-${2100 - i}`, date: l.signalDate, source: l.source, text: l.triggerText,
    url: l.sourceUrl, geo: l.city, niche: l.category, trigger: triggerLabels[l.trigger] ?? l.trigger,
    lead: l.company, status: i === leads.length - 1 ? "needs_review" : "processed",
  }));
  return (
    <>
      <Topbar title="Сигналы" subtitle="Лента сырых сигналов до и после превращения в лиды" />
      <div className="p-8">
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Источник</th>
                <th className="px-4 py-3 font-medium">Текст сигнала</th>
                <th className="px-4 py-3 font-medium">Гео / Ниша</th>
                <th className="px-4 py-3 font-medium">Триггер</th>
                <th className="px-4 py-3 font-medium">Лид</th>
                <th className="px-4 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-400">{s.id}</td>
                  <td className="px-4 py-3 text-slate-500">{s.date}</td>
                  <td className="px-4 py-3 text-slate-600">{s.source}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{s.text}</td>
                  <td className="px-4 py-3 text-slate-600">{s.geo}<div className="text-xs text-slate-400">{s.niche}</div></td>
                  <td className="px-4 py-3 text-slate-600">{s.trigger}</td>
                  <td className="px-4 py-3 text-brand">{s.lead}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusPill[s.status]}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
