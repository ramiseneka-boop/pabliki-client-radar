import { replyClassifications } from "@/lib/mock";
import { mockMeta, badRequest, fakeId } from "@/app/api/_util/meta";
import type { ReplyClassificationLabel } from "@/lib/types";

// GET /api/replies — список классифицированных ответов лидов.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classification = searchParams.get("classification");

  let result = replyClassifications;
  if (classification) result = result.filter((r) => r.classification === classification);

  return Response.json({
    replies: result,
    total: result.length,
    meta: mockMeta(
      "Классификации ответов отдаются из lib/mock.ts. В проде: таблица reply_classifications, заполняемая AI-классификатором входящих сообщений."
    ),
  });
}

// POST /api/replies — классифицировать новый произвольный ответ (не привязанный к конкретному лиду).
// См. также /api/leads/:id/classify-reply для привязки к лиду.
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Тело запроса должно быть JSON.");
  }
  if (!body || typeof body !== "object" || !body.replyText) {
    return badRequest("Поле 'replyText' обязательно.");
  }

  const text = String(body.replyText).toLowerCase();
  let classification: ReplyClassificationLabel = "needs_followup";
  if (text.includes("дорог")) classification = "objection_price";
  else if (text.includes("не сейчас") || text.includes("позже")) classification = "objection_timing";
  else if (text.includes("не интересн")) classification = "not_interested";

  return Response.json(
    {
      reply: {
        id: fakeId("RC"),
        leadId: body.leadId ?? null,
        replyText: body.replyText,
        classification,
        suggestedNextAction: "Сформировано простой keyword-эвристикой, не реальной AI-моделью.",
      },
      meta: mockMeta(
        "Классификация выполняется простой keyword-эвристикой, не реальной LLM. В проде здесь будет вызов OPENAI_API_KEY/ANTHROPIC_API_KEY."
      ),
    },
    { status: 201 }
  );
}
