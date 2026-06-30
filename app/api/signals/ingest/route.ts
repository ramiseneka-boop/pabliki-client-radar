import { pendingAccessMeta, badRequest, fakeId } from "@/app/api/_util/meta";

// POST /api/signals/ingest — обобщённый webhook-приёмник входящих сигналов
// (для будущих источников: сайт, формы, внешние вебхуки). Пока ни один реальный
// источник не настроен присылать сюда данные — это заглушка-приёмник.
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Тело запроса должно быть JSON.");
  }
  if (!body || typeof body !== "object" || !body.source) {
    return badRequest("Поле 'source' обязательно (идентификатор источника сигнала).");
  }

  return Response.json(
    {
      received: true,
      ingestedId: fakeId("SIG"),
      meta: pendingAccessMeta(
        "Webhook-приёмник сигналов — заглушка. Принятые данные не сохраняются и не запускают pipeline scoring/temperature/sla. В проде: запись в webhooks_inbound, валидация подписи источника, постановка в очередь обработки."
      ),
    },
    { status: 202 }
  );
}
