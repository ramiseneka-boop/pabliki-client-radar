import { leads } from "@/lib/mock";
import { mockMeta, badRequest, fakeId } from "@/app/api/_util/meta";

// GET /api/leads — список лидов (мок-данные из lib/mock.ts).
// Поддерживает простую фильтрацию по query-параметрам для удобства фронтенда:
// ?city=, ?category=, ?status=, ?manager=, ?temperature=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const manager = searchParams.get("manager");
  const temperature = searchParams.get("temperature");

  let result = leads;
  if (city) result = result.filter((l) => l.city === city);
  if (category) result = result.filter((l) => l.category === category);
  if (status) result = result.filter((l) => l.status === status);
  if (manager) result = result.filter((l) => l.manager === manager);
  if (temperature) result = result.filter((l) => l.temperature === temperature);

  return Response.json({
    leads: result,
    total: result.length,
    meta: mockMeta(
      "Список лидов отдаётся из lib/mock.ts (статичные демо-данные). В проде это будет SELECT из таблицы leads (см. db/schema.sql) с пагинацией и реальными источниками."
    ),
  });
}

// POST /api/leads — создание лида (заглушка). Ничего не сохраняется,
// просто проверяем форму запроса и возвращаем фейковый успешный конверт.
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Тело запроса должно быть JSON.");
  }
  if (!body || typeof body !== "object" || !body.company) {
    return badRequest("Поле 'company' обязательно.");
  }

  const created = {
    id: fakeId("L"),
    company: body.company,
    category: body.category ?? null,
    city: body.city ?? null,
    trigger: body.trigger ?? null,
    source: body.source ?? "manual",
    status: "new",
    createdAt: new Date().toISOString(),
  };

  return Response.json(
    {
      lead: created,
      meta: mockMeta(
        "Создание лида — заглушка. Запись не сохраняется ни в какой базе данных. В проде: INSERT в таблицу leads, запуск scoring/temperature/sla pipeline."
      ),
    },
    { status: 201 }
  );
}
