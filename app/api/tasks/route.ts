import { tasksToday } from "@/lib/mock";
import { mockMeta, badRequest, fakeId } from "@/app/api/_util/meta";

// GET /api/tasks — список всех задач (мок: tasksToday из lib/mock.ts).
export async function GET() {
  return Response.json({
    tasks: tasksToday,
    total: tasksToday.length,
    meta: mockMeta(
      "Задачи отдаются из lib/mock.ts (tasksToday), статичный список. В проде это будет таблица tasks с due_at/status/assignee и реальной очередью по менеджерам."
    ),
  });
}

// POST /api/tasks — создание задачи вручную (заглушка).
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Тело запроса должно быть JSON.");
  }
  if (!body || typeof body !== "object" || !body.lead) {
    return badRequest("Поле 'lead' обязательно.");
  }

  return Response.json(
    {
      task: {
        id: fakeId("T"),
        lead: body.lead,
        type: body.type ?? "follow_up",
        due: body.due ?? "Сегодня",
        manager: body.manager ?? "—",
        priority: body.priority ?? "watch",
      },
      meta: mockMeta(
        "Создание задачи — заглушка, ничего не сохраняется. В проде: INSERT в таблицу tasks + уведомление назначенному менеджеру."
      ),
    },
    { status: 201 }
  );
}
