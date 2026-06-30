import { offers } from "@/lib/mock";
import { mockMeta, badRequest, fakeId } from "@/app/api/_util/meta";

// GET /api/offers — список офферов (Offer Testing Lab).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const niche = searchParams.get("niche");

  let result = offers;
  if (status) result = result.filter((o) => o.status === status);
  if (niche) result = result.filter((o) => o.niche === niche);

  return Response.json({
    offers: result,
    total: result.length,
    meta: mockMeta(
      "Офферы отдаются из lib/mock.ts (статичный список). В проде это будет таблица offers с реальными conversionRate, посчитанными из offer_tests."
    ),
  });
}

// POST /api/offers — создание оффера (заглушка).
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Тело запроса должно быть JSON.");
  }
  if (!body || typeof body !== "object" || !body.name || !body.niche) {
    return badRequest("Поля 'name' и 'niche' обязательны.");
  }

  return Response.json(
    {
      offer: {
        id: fakeId("OF"),
        name: body.name,
        niche: body.niche,
        channel: body.channel ?? null,
        packageDescription: body.packageDescription ?? "",
        priceFrom: body.priceFrom ?? 0,
        priceTo: body.priceTo ?? 0,
        conversionRateMock: 0,
        sampleSize: 0,
        status: "testing",
      },
      meta: mockMeta(
        "Создание оффера — заглушка, ничего не сохраняется. В проде: INSERT в таблицу offers со status='testing'."
      ),
    },
    { status: 201 }
  );
}
