import Topbar from "@/components/Topbar";
import { salesScripts, triggerLabels } from "@/lib/mock";

export default function ScriptsPage() {
  const groups = new Map<string, typeof salesScripts>();
  for (const s of salesScripts) {
    const key = s.triggerType;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  return (
    <>
      <Topbar title="Sales Script Mode" subtitle="Готовые скрипты продаж по типу триггера и возражениям" />
      <div className="p-8 space-y-6">
        {Array.from(groups.entries()).map(([trigger, scripts]) => (
          <div key={trigger} className="card p-6">
            <h2 className="font-bold text-graphite mb-4">
              {trigger === "any" ? "Возражения (универсальные)" : triggerLabels[trigger] ?? trigger}
            </h2>
            <div className="space-y-4">
              {scripts.map((s) => (
                <details key={s.id} className="rounded-lg border border-slate-200 group" open>
                  <summary className="px-4 py-3 cursor-pointer font-medium text-graphite flex items-center justify-between">
                    <span>
                      {s.situation}
                      {s.niche && <span className="text-xs text-slate-400 ml-2">({s.niche})</span>}
                    </span>
                    {s.objectionHandled && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200 shrink-0">
                        возражение: {s.objectionHandled}
                      </span>
                    )}
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm text-slate-700 leading-relaxed">{s.scriptText}</p>
                      <button className="mt-2 text-xs text-brand font-medium">⧉ Копировать</button>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
