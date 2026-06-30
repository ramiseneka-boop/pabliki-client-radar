import { leads } from "@/lib/mock";
import { mockMeta, realMeta, notFound, badRequest } from "@/app/api/_util/meta";
import { isDbConfigured } from "@/lib/db";
import { getLeadFromDb, updateLeadInDb } from "@/lib/leadsRepository";

export const dynamic = "force-dynamic";

// GET /api/leads/:id — детали одного лида. Реальная БД, если настроена,
// иначе — тот же mock-фолбэк, что был раньше.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (isDbConfigured()) {
    try {
      const dbLead = await getLeadFromDb(params.id);
      if (dbLead) {
        return Response.json({
          lead: dbLead,
          meta: realMeta("Лид загружен из настоящей БД (Supabase, таблица leads)."),
        });
      }
      // не найден в БД — попробуем mock ниже (например это демо-id из lib/mock.ts)
    } catch (err: any) {
      return Response.json({ error: `Ошибка чтения из БД: ${err?.message ?? err}` }, { status: 502 });
    }
  }

  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден.`);

  return Response.json({
    lead,
    meta: mockMeta(
      "Данные лида берутся из lib/mock.ts (демо-данные) — реальная БД ещё не настроена или этот id не найден в Supabase."
    ),
  });
}

// PATCH /api/leads/:id — частичное обновление лида. Реально сохраняется
// в Supabase, если настроена БД; иначе — прежняя заглушка без персистентности.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Тело запроса должно быть JSON.");
  }

  if (isDbConfigured()) {
    try {
      const updated = await updateLeadInDb(params.id, body);
      if (updated) {
        return Response.json({
          lead: updated,
          meta: realMeta("Лид по-настоящему обновлён в Supabase (таблица leads)."),
        });
      }
      // не найден в БД — попробуем mock ниже
    } catch (err: any) {
      return Response.json({ error: `Ошибка записи в БД: ${err?.message ?? err}` }, { status: 502 });
    }
  }

  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден.`);

  const updated = { ...lead, ...body, id: lead.id, updatedAt: new Date().toISOString() };

  return Response.json({
    lead: updated,
    meta: mockMeta(
      "Обновление лида — заглушка. Изменения не сохраняются (in-memory mock неизменяем между запросами). Подключите Supabase, чтобы изменения сохранялись по-настоящему."
    ),
  });
}
