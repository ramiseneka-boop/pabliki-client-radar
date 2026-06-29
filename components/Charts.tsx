// Лёгкие чарты на чистом CSS/SVG (без внешних зависимостей)

export function BarList({ data, unit = "" }: { data: { name: string; value: number }[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.name}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">{d.name}</span>
            <span className="font-semibold text-graphite">{d.value}{unit}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-brand" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Donut({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const r = 54, c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 140 140" className="w-36 h-36 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#F1F5F9" strokeWidth="18" />
        {data.map((d) => {
          const frac = d.value / total;
          const dash = frac * c;
          const el = (
            <circle key={d.name} cx="70" cy="70" r={r} fill="none" stroke={d.color}
              strokeWidth="18" strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-acc} />
          );
          acc += dash;
          return el;
        })}
      </svg>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="text-slate-600">{d.name}</span>
            <span className="ml-auto font-semibold text-graphite">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Funnel({ data }: { data: { stage: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const conv = i === 0 ? 100 : Math.round((d.value / data[0].value) * 100);
        return (
          <div key={d.stage} className="flex items-center gap-3">
            <span className="w-32 text-sm text-slate-600 shrink-0">{d.stage}</span>
            <div className="flex-1 h-7 bg-slate-100 rounded-md overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand to-brand-light rounded-md flex items-center px-2 text-white text-xs font-semibold"
                style={{ width: `${pct}%` }}>
                {d.value}
              </div>
            </div>
            <span className="w-12 text-right text-xs text-slate-400">{conv}%</span>
          </div>
        );
      })}
    </div>
  );
}
