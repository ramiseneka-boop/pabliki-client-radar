import Topbar from "@/components/Topbar";

const sources = [
  { key: "pabliki_site", name: "Сайт Pabliki.kz (webhooks)", mode: "auto", status: "active", last: "сегодня 09:12", count: 68, reliability: 1.0 },
  { key: "google_places", name: "Google Places", mode: "auto", status: "active", last: "сегодня 08:40", count: 164, reliability: 0.8 },
  { key: "2gis", name: "2GIS", mode: "semi", status: "active", last: "сегодня 08:10", count: 102, reliability: 0.75 },
  { key: "rss", name: "Новости / RSS", mode: "auto", status: "active", last: "сегодня 07:55", count: 81, reliability: 0.6 },
  { key: "wordstat", name: "Поисковые тренды / Wordstat", mode: "semi", status: "active", last: "вчера 18:00", count: 22, reliability: 0.55 },
  { key: "meta_ads", name: "Meta Ad Library", mode: "semi", status: "paused", last: "—", count: 0, reliability: 0.7 },
  { key: "instagram", name: "Instagram (бизнес-аккаунты)", mode: "semi", status: "paused", last: "—", count: 0, reliability: 0.5 },
  { key: "telegram", name: "Telegram-каналы", mode: "semi", status: "paused", last: "—", count: 0, reliability: 0.55 },
  { key: "goszakup", name: "Госзакупки KZ", mode: "auto", status: "paused", last: "—", count: 0, reliability: 0.85 },
  { key: "csv_import", name: "Excel/CSV импорт", mode: "manual", status: "active", last: "вчера 14:20", count: 47, reliability: 0.65 },
  { key: "manual", name: "Ручное добавление", mode: "manual", status: "active", last: "сегодня 10:05", count: 9, reliability: 0.7 },
];

const statusPill: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  paused: "bg-slate-100 text-slate-500 ring-slate-200",
  error: "bg-red-50 text-red-600 ring-red-200",
};
const modeLabel: Record<string, string> = { auto: "Авто", semi: "Полуавто", manual: "Ручной" };

export default function SourcesPage() {
  return (
    <>
      <Topbar title="Источники" subtitle="Подключение и мониторинг источников сигналов · MVP 0.1 → 0.3" />
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sources.map((s) => (
          <div key={s.key} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-graphite">{s.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{modeLabel[s.mode]} · надёжность {s.reliability}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ring-1 ${statusPill[s.status]}`}>
                {s.status === "active" ? "активен" : s.status === "paused" ? "пауза" : "ошибка"}
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-graphite">{s.count}</div>
                <div className="text-xs text-slate-400">сигналов</div>
              </div>
              <div className="text-right text-xs text-slate-400">
                посл. запуск<br />{s.last}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-1.5 rounded-lg bg-brand text-white text-sm">Запустить</button>
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600">Настроить</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
