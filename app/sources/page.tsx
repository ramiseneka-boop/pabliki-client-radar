import Topbar from "@/components/Topbar";
import { sources } from "@/lib/sources";

const statusPill: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  mock: "bg-sky-50 text-sky-600 ring-sky-200",
  pending_access: "bg-amber-50 text-amber-600 ring-amber-200",
  error: "bg-red-50 text-red-600 ring-red-200",
  disabled: "bg-slate-100 text-slate-500 ring-slate-200",
};
const statusLabel: Record<string, string> = {
  active: "активен",
  mock: "мок-данные",
  pending_access: "нужен доступ",
  error: "ошибка",
  disabled: "отключён",
};
const modeLabel: Record<string, string> = { auto: "Авто", semi: "Полуавто", manual: "Ручной" };

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function SourcesPage() {
  return (
    <>
      <Topbar title="Источники" subtitle="Подключение и мониторинг источников сигналов · MVP 0.1 → 0.3" />
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sources.map((s) => {
          const isPendingAccess = s.status === "pending_access";
          return (
            <div key={s.key} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-graphite">{s.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{modeLabel[s.mode]} · надёжность {s.reliability}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ring-1 shrink-0 ${statusPill[s.status]}`}>
                  {statusLabel[s.status]}
                </span>
              </div>

              {isPendingAccess && s.required_env_vars.length > 0 && (
                <div className="mt-2 text-[11px] text-amber-600 bg-amber-50 rounded-md px-2 py-1.5">
                  Нужны переменные окружения: {s.required_env_vars.join(", ")}
                </div>
              )}
              {s.notes && <div className="mt-2 text-xs text-slate-400">{s.notes}</div>}

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-graphite">{s.count}</div>
                  <div className="text-xs text-slate-400">сигналов</div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  посл. запуск<br />{formatTime(s.last_run_at)}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  disabled={isPendingAccess}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-sm transition ${
                    isPendingAccess
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                      : "bg-brand text-white hover:bg-brand-light"
                  }`}
                  title={isPendingAccess ? "Требует API-ключ" : undefined}
                >
                  Запустить
                </button>
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                  Настроить
                </button>
              </div>
              {isPendingAccess && <div className="mt-1.5 text-[11px] text-amber-500">Требует API-ключ</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}
