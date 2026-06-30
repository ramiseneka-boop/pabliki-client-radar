import { leads, replyClassifications } from "@/lib/mock";
import { mockMeta, notFound, badRequest, fakeId } from "@/app/api/_util/meta";
import type { ReplyClassificationLabel } from "@/lib/types";

// GET /api/leads/:id/classify-reply — существующие классификации ответов по лиду.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден в mock-данных.`);

  const classifications = replyClassifications.filter((rc) => rc.leadId === lead.id);

  return Response.json({
    leadId: lead.id,
    classifications,
    meta: mockMeta(
      "Классификации ответов берутся из lib/mock.ts (replyClassifications). В проде это будет AI-классификация входящего текста (OpenAI/Anthropic) с сохранением в reply_classifications."
    ),
  });
}

// POST /api/leads/:id/classify-reply — классифицировать новый текст ответа (заглушка).
// Возвращает простую keyword-эвристику вместо реального вызова LLM.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден в mock-данных.`);

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
  else if (text.includes("не сейчас") || text.includes("позже") || text.includes("подума"))
    classification = "objection_timing";
  else if (text.includes("не интересн")) classification = "not_interested";
  else if (text.includes("ошиб") || text.includes("не туда")) classification = "wrong_contact";
  else if (text.includes("уже разме") || text.includes("уже клиент")) classification = "already_client";
  else if (text.includes("интересн") || text.includes("да,") || text.includes("давайте"))
    classification = "interested";

  return Response.json({
    id: fakeId("RC"),
    leadId: lead.id,
    replyText: body.replyText,
    classification,
    suggestedNextAction: "Сформировано простой keyword-эвристикой, не реальной AI-моделью.",
    meta: mockMeta(
      "Классификация выполняется простой keyword-эвристикой на сервере, а не реальной LLM. В проде здесь будет вызов OPENAI_API_KEY/ANTHROPIC_API_KEY с промптом по taxonomy ReplyClassificationLabel."
    ),
  });
}
