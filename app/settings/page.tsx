import Topbar from "@/components/Topbar";

const weights = [
  { f: "Сила рекламного триггера", w: 25 },
  { f: "Денежность ниши", w: 20 },
  { f: "Есть способ связи", w: 15 },
  { f: "Гео закрыто пабликами", w: 15 },
  { f: "Признаки бюджета", w: 10 },
  { f: "Свежесть сигнала", w: 10 },
  { f: "Надёжность источника", w: 5 },
];

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Настройки / API" subtitle="Команда, роли, API-ключи, webhooks, веса Priority Score" />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-bold text-graphite mb-4">Команда и роли</h2>
          <div className="space-y-2">
            {[
              { n: "Айгерим", r: "Super Admin" },
              { n: "Дамир", r: "Manager" },
              { n: "Инвестор", r: "Viewer" },
            ].map((u) => (
              <div key={u.n} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                <span className="text-sm font-medium text-graphite">{u.n}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-brand-soft text-brand">{u.r}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-graphite mb-4">API-ключи</h2>
          <div className="p-3 rounded-lg bg-slate-50 font-mono text-xs text-slate-600 break-all">prk_live_••••••••••••••••••••••3a9f</div>
          <div className="mt-2 text-xs text-slate-400">Scope: leads:read, leads:write, webhooks:receive</div>
          <button className="mt-3 px-3 py-1.5 rounded-lg bg-brand text-white text-sm">Выпустить новый ключ</button>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-graphite mb-4">Webhook от Pabliki.kz</h2>
          <div className="p-3 rounded-lg bg-slate-50 font-mono text-xs text-slate-600 break-all">POST https://radar.pabliki.kz/webhooks/pabliki/event</div>
          <div className="mt-3 space-y-1.5 text-sm text-slate-600">
            {["advertiser_registered", "selection_abandoned", "payment_abandoned", "proposal_downloaded", "whatsapp_clicked", "budget_entered", "old_client_reactivated"].map((e) => (
              <div key={e} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{e}</div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-graphite mb-4">Веса Priority Score</h2>
          <div className="space-y-3">
            {weights.map((w) => (
              <div key={w.f}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{w.f}</span><span className="font-semibold text-graphite">{w.w}</span></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-brand rounded-full" style={{ width: `${(w.w / 25) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-400">Порог горячих: 90 · тёплых: 75 · наблюдать: 50</div>
        </div>
      </div>
    </>
  );
}
