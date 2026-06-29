export default function MetricCard({
  label, value, accent, hint,
}: { label: string; value: string; accent?: boolean; hint?: string }) {
  return (
    <div className={`card p-5 ${accent ? "ring-2 ring-brand/20" : ""}`}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${accent ? "text-brand" : "text-graphite"}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
