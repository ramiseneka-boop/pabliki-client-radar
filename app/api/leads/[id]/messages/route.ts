import { leads } from "@/lib/mock";
import { mockMeta, pendingAccessMeta, notFound, badRequest, fakeId } from "@/app/api/_util/meta";

// GET /api/leads/:id/messages — сгенерированные сообщения (WhatsApp + follow-ups)
// для лида. Тексты уже сгенерированы в mock-данных (whatsappMessage/followUp1d/3d).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден в mock-данных.`);

  return Response.json({
    leadId: lead.id,
    messages: [
      { type: "initial", channel: "whatsapp", text: lead.whatsappMessage },
      { type: "follow_up_1d", channel: "whatsapp", text: lead.followUp1d },
      { type: "follow_up_3d", channel: "whatsapp", text: lead.followUp3d },
    ],
    meta: mockMeta(
      "Тексты сообщений — заранее написанные mock-строки из lib/mock.ts. В проде это будет AI-генерация (OpenAI/Anthropic) по шаблонам message_templates + персонализация по lead/company."
    ),
  });
}

// POST /api/leads/:id/messages — "отправка" сообщения. WhatsApp Business API
// не подключён, поэтому это pending_access, а не mock: ничего реально не отправляется.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден в mock-данных.`);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Тело запроса должно быть JSON.");
  }
  if (!body || typeof body !== "object" || !body.text) {
    return badRequest("Поле 'text' обязательно.");
  }

  return Response.json(
    {
      sent: false,
      fakeMessageId: fakeId("MSG"),
      leadId: lead.id,
      meta: pendingAccessMeta(
        "Отправка через WhatsApp Business API не подключена (нет токена). Сообщение не отправлено реально — это симуляция успешного ответа для разработки UI.",
        ["WHATSAPP_BUSINESS_TOKEN"]
      ),
    },
    { status: 202 }
  );
}
