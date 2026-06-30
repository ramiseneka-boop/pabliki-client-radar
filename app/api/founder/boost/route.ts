import { leads } from "@/lib/mock";
import { mockMeta, notFound, badRequest } from "@/app/api/_util/meta";

// POST /api/founder/boost — переключить founder priority boost для лида (заглушка).
// Изменение не сохраняется, так как mock-данные иммутабельны между запросами.
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Тело запроса должно быть JSON.");
  }
  if (!body || typeof body !== "object" || !body.leadId) {
    return badRequest("Поле 'leadId' обязательно.");
  }

  const lead = leads.find((l) => l.id === body.leadId);
  if (!lead) return notFound(`Лид с id=${body.leadId} не найден в mock-данных.`);

  const newBoostState = body.boosted ?? !lead.isFounderBoosted;

  return Response.json({
    leadId: lead.id,
    isFounderBoosted: newBoostState,
    meta: mockMeta(
      "Переключение founder boost — заглушка, состояние не сохраняется (in-memory mock неизменяем). В проде: UPSERT в таблицу founder_boosts + пересчёт очереди приоритетов."
    ),
  });
}
