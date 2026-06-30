import { doNotContactList } from "@/lib/mock";
import { mockMeta, badRequest } from "@/app/api/_util/meta";

// GET /api/do-not-contact — чёрный список (БИН/телефон, не контактировать).
export async function GET() {
  return Response.json({
    entries: doNotContactList,
    total: doNotContactList.length,
    meta: mockMeta(
      "Список Do-Not-Contact отдаётся из lib/mock.ts. В проде это будет таблица do_not_contact, проверяемая перед каждой отправкой сообщения/звонком."
    ),
  });
}

// POST /api/do-not-contact — добавление записи в чёрный список (заглушка).
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Тело запроса должно быть JSON.");
  }
  if (!body || typeof body !== "object" || (!body.bin && !body.phone)) {
    return badRequest("Требуется хотя бы одно из полей 'bin' или 'phone'.");
  }
  if (!body.reason) {
    return badRequest("Поле 'reason' обязательно.");
  }

  return Response.json(
    {
      entry: {
        bin: body.bin ?? undefined,
        phone: body.phone ?? undefined,
        reason: body.reason,
        addedAt: new Date().toISOString(),
      },
      meta: mockMeta(
        "Добавление в чёрный список — заглушка, запись не сохраняется. В проде: INSERT в do_not_contact + немедленная проверка во всех активных очередях."
      ),
    },
    { status: 201 }
  );
}
