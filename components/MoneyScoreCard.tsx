import { tenge } from "@/lib/mock";

export default function MoneyScoreCard({
  moneyPriorityScore, dealProbability, potentialDealSize, expectedMargin,
}: {
  moneyPriorityScore?: number;
  dealProbability?: number;
  potentialDealSize?: number;
  expectedMargin?: number;
}) {
  const hasBreakdown = dealProbability !== undefined && potentialDealSize !== undefined && expectedMargin !== undefined;
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-graphite">Money Priority</h3>
        <span className="text-lg font-bold text-brand">{moneyPriorityScore ?? "—"}</span>
      </div>
      {hasBreakdown ? (
        <div className="text-sm text-slate-500">
          {Math.round((dealProbability as number) * 100)}% вероятность × {tenge(potentialDealSize as number)} потенциал ×{" "}
          {Math.round((expectedMargin as number) * 100)}% маржа
        </div>
      ) : (
        <div className="text-sm text-slate-400">Недостаточно данных для разбивки</div>
      )}
    </div>
  );
}
