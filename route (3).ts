import { leads } from "@/lib/mock";
import { mockMeta, realMeta, badRequest } from "@/app/api/_util/meta";
import { isDbConfigured } from "@/lib/db";
import { listLeadsFromDb, createLeadInDb } from "@/lib/leadsRepository";

// API route обращается к process.env (isDbConfigured) и к реальной БД — должен
// выполняться на каждый запрос, без статического кеширования сборки.
export const dynamic = "force-dynamic";

// GET /api/leads — список лидов.
// Если настроена реальная БД (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY в
// переменных окружения — см. lib/db.ts), отдаются НАСТОЯЩИЕ лиды из Supabase.
// Если нет — поведение не меняется: те же демо-данные из lib/mock.ts, что и раньше.
// Поддерживает простую фильтрацию по query-параметрам: ?city=, ?category=,
// ?status=, ?manager=, ?temperature=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filters = {
    city: searchParams.get("city"),
    category: searchParams.get("category"),
    status: searchParams.get("status"),
    manager: searchParams.get("manager"),
    temperature: searchParams.get("temperature"),
  };

  if (isDbConfigured()) {
    try {
      const dbLeads = await listLeadsFromDb(filters);
      if (dbLeads !== null) {
        return Response.json({
          leads: dbLeads,
          total: dbLeads.length,
          meta: realMeta(
            "Список лидов из настоящей БД (Supabase, таблица leads). Демо-данные lib/mock.ts здесь не используются."
          ),
        });
      }
    } catch (err: any) {
      // Не роняем эндпоинт из-за временной проблемы с БД — честно сообщаем
      // об ошибке, но не маскируем её под мок (это важно для отладки).
      return Response.json(
        { leads: [], total: 0, error: `Ошибка чтения из БД: ${err?.message ?? err}` },
        { status: 502 }
      );
    }
  }

  let result = leads;
  if (filters.city) result = result.filter((l) => l.city === filters.city);
  if (filters.category) result = result.filter((l) => l.category === filters.category);
  if (filters.status) result = result.filter((l) => l.status === filters.status);
  if (filters.manager) result = result.filter((l) => l.manager === filters.manager);
  if (filters.temperature) result = result.filter((l) => l.temperature === filters.temperature);

  return Response.json({
    leads: result,
    total: result.length,
    meta: mockMeta(
      "Список лидов отдаётся из lib/mock.ts (статичные демо-данные) — реальная БД ещё не настроена. См. db/migrations/0001_leads_mvp.sql и REAL_DATA_SETUP.md, чтобы подключить Supabase.",
      ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
    ),
  });
}

// POST /api/leads — создание лида.
// Если настроена реальная БД — лид по-настоящему сохраняется в Supabase
// (с расчётом temperature/SLA/Money Priority Score теми же формулами, что
// использует остальная система). Если БД не настроена — поведение как раньше:
// честная заглушка без персистентности.
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

  if (isDbConfigured()) {
    try {
      const created = await createLeadInDb({
        company: body.company,
        category: body.category ?? null,
        city: body.city ?? null,
        address: body.address ?? null,
        trigger: body.trigger ?? null,
        triggerText: body.triggerText ?? null,
        source: body.source ?? "manual",
        sourceUrl: body.sourceUrl ?? null,
        contacts: body.contacts ?? null,
        manager: body.manager ?? null,
        budgetMin: body.budgetMin ?? null,
        budgetMax: body.budgetMax ?? null,
      });
      if (created) {
        return Response.json(
          {
            lead: created,
            meta: realMeta(
              "Лид по-настоящему сохранён в Supabase (таблица leads). temperature/SLA/Money Priority Score рассчитаны автоматически."
            ),
          },
          { status: 201 }
        );
      }
    } catch (err: any) {
      return Response.json({ error: `Ошибка записи в БД: ${err?.message ?? err}` }, { status: 502 });
    }
  }

  const created = {
    id: `L-${Math.random().toString(36).slice(2, 8)}`,
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
        "Создание лида — заглушка. Запись не сохраняется ни в какой базе данных. Подключите Supabase (db/migrations/0001_leads_mvp.sql, REAL_DATA_SETUP.md), чтобы лиды реально сохранялись.",
        ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
      ),
    },
    { status: 201 }
  );
}
