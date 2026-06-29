export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-10 bg-canvas/80 backdrop-blur border-b border-slate-200 px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-graphite">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 w-64">
            <span>⌕</span>
            <span>Поиск по компании, БИН, телефону…</span>
          </div>
          <button className="w-9 h-9 grid place-items-center bg-white border border-slate-200 rounded-lg text-slate-500">🔔</button>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">Демо-данные</span>
        </div>
      </div>
    </header>
  );
}
