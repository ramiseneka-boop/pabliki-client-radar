import { tasksToday } from "@/lib/mock";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/tasks/today — очередь "Manager Today": задачи на сегодня,
// отсортированные по приоритету (hot -> warm -> watch -> base).
const PRIORITY_ORDER: Record<string, number> = { hot: 0, warm: 1, watch: 2, base: 3 };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const manager = searchParams.get("manager");

  let tasks = [...tasksToday].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
  );
  if (manager) tasks = tasks.filter((t) => t.manager === manager);

  return Response.json({
    tasks,
    total: tasks.length,
    meta: mockMeta(
      "Очередь 'Сегодня' строится из статичного tasksToday (lib/mock.ts), отсортированного по приоритету. В проде это будет WHERE due_at::date = current_date ORDER BY priority с учётом SLA/temperature."
    ),
  });
}
