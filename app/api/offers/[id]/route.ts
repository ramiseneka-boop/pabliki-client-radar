import { offers } from "@/lib/mock";
import { mockMeta, notFound, badRequest } from "@/app/api/_util/meta";

// GET /api/offers/:id — детали оффера.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const offer = offers.find((o) => o.id === params.id);
  if (!offer) return notFound(`Оффер с id=${params.id} не найден в mock-данных.`);

  return Response.json({
    offer,
    meta: mockMeta(
      "Данные оффера берутся из lib/mock.ts. В проде: SELECT по id из таблицы offers + агрегаты из offer_tests."
    ),
  });
}

// PATCH /api/offers/:id — обновление оффера (заглушка, например смена статуса testing -> winner/retired).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const offer = offers.find((o) => o.id === params.id);
  if (!offer) return notFound(`Оффер с id=${params.id} не найден в mock-данных.`);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Тело запроса должно быть JSON.");
  }

  const updated = { ...offer, ...body, id: offer.id };

  return Response.json({
    offer: updated,
    meta: mockMeta(
      "Обновление оффера — заглушка, изменения не сохраняются. В проде: UPDATE offers SET ... WHERE id = :id."
    ),
  });
}
