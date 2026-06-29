import Topbar from "@/components/Topbar";
import { tasksToday, actionLabels, priorityMeta } from "@/lib/mock";

const columns = [
  { key: "open", title: "К выполнению" },
  { key: "in_progress", title: "В работе" },
  { key: "done", title: "Готово" },
];

export default function TasksPage() {
  const board: Record<string, typeof tasksToday> = {
    open: tasksToday.slice(0, 3),
    in_progress: tasksToday.slice(3, 4),
    done: tasksToday.slice(4),
  };
  return (
    <>
      <Topbar title="Задачи" subtitle="Канбан задач менеджеров · кому писать и что делать" />
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((col) => (
          <div key={col.key} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-semibold text-graphite">{col.title}</h2>
              <span className="text-xs text-slate-400">{board[col.key].length}</span>
            </div>
            {board[col.key].map((t) => (
              <div key={t.id} className={`card p-4 border-l-4 ${priorityMeta[t.priority as "hot" | "warm"].row}`}>
                <div className="font-medium text-graphite">{t.lead}</div>
                <div className="text-sm text-brand mt-1">{actionLabels[t.type]}</div>
                <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                  <span>{t.manager}</span>
                  <span>{t.due}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
