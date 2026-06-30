import { leads } from "@/lib/mock";
import { mockMeta, notFound, badRequest } from "@/app/api/_util/meta";

// GET /api/leads/:id — детали одного лида.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден в mock-данных.`);

  return Response.json({
    lead,
    meta: mockMeta(
      "Данные лида берутся из lib/mock.ts. В проде это будет SELECT по id из таблицы leads с join на companies/contacts."
    ),
  });
}

// PATCH /api/leads/:id — частичное обновление лида (заглушка, без персистентности).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден в mock-данных.`);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Тело запроса должно быть JSON.");
  }

  const updated = { ...lead, ...body, id: lead.id, updatedAt: new Date().toISOString() };

  return Response.json({
    lead: updated,
    meta: mockMeta(
      "Обновление лида — заглушка. Изменения не сохраняются (in-memory mock неизменяем между запросами). В проде: UPDATE leads SET ... WHERE id = :id + запись в audit_log."
    ),
  });
}
