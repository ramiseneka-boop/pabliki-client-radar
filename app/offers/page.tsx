import Topbar from "@/components/Topbar";
import { offers, tenge } from "@/lib/mock";

const statusPill: Record<string, string> = {
  testing: "bg-sky-50 text-sky-600 ring-sky-200",
  winner: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  retired: "bg-slate-100 text-slate-500 ring-slate-200",
};
const statusLabel: Record<string, string> = {
  testing: "тестируется",
  winner: "победитель",
  retired: "снят с теста",
};

export default function OffersPage() {
  return (
    <>
      <Topbar title="Offer Testing Lab" subtitle="Тестируемые рекламные офферы и их конверсия по нишам" />
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {offers.map((o) => (
          <div key={o.id} className="card p-5 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-graphite">{o.name}</div>
              <span className={`text-xs px-2 py-1 rounded-full ring-1 shrink-0 ${statusPill[o.status]}`}>
                {statusLabel[o.status]}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">{o.niche} · {o.channel}</div>
            <p className="text-sm text-slate-600 mt-3 flex-1">{o.packageDescription}</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-xs text-slate-400">Цена</div>
                <div className="font-semibold text-graphite">{tenge(o.priceFrom)} – {tenge(o.priceTo)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Конверсия (n={o.sampleSize})</div>
                <div className="font-bold text-brand">{Math.round(o.conversionRateMock * 100)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
