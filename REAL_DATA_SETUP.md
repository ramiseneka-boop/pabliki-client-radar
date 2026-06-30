import { getEffectiveSources } from "@/lib/sources";
import { pendingAccessMeta, realMeta, badRequest } from "@/app/api/_util/meta";
import { fetchGooglePlacesLeads } from "@/lib/connectors/googlePlaces";
import { isDbConfigured } from "@/lib/db";
import { bulkInsertLeadsInDb } from "@/lib/leadsRepository";
import type { NewLeadInput } from "@/lib/leadsRepository";

export const dynamic = "force-dynamic";

// GET /api/connectors/google-places — статус и конфигурация коннектора Google Places.
// "active", если GOOGLE_PLACES_API_KEY задан — иначе pending_access.
export async function GET() {
  const source = getEffectiveSources().find((s) => s.key === "google_places");
  const requiredEnvVars = ["GOOGLE_PLACES_API_KEY"];
  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);

  return Response.json({
    connector: source ?? null,
    requiredEnvVars,
    missingEnvVars,
    configured: missingEnvVars.length === 0,
    meta:
      missingEnvVars.length === 0
        ? realMeta(
            "GOOGLE_PLACES_API_KEY задан — коннектор подключён. Запустите реальный поиск через POST /api/connectors/google-places с телом {query, city}."
          )
        : pendingAccessMeta(
            "Коннектор Google Places не подключён: отсутствует GOOGLE_PLACES_API_KEY. Реальные вызовы Places API не выполняются.",
            requiredEnvVars
          ),
  });
}

// POST /api/connectors/google-places — реальный запуск поиска.
// Тело запроса: { query: string (ниша, напр. "фитнес клуб"), city: string (напр. "Алматы"), limit?: number }.
// Делает настоящий вызов Google Places Text Search + Details. Если в окружении
// настроена БД (SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY), найденные точки
// сохраняются как новые лиды (источник "Google Places"). Если БД не настроена,
// найденные точки просто возвращаются в ответе без сохранения.
export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        triggered: false,
        meta: pendingAccessMeta(
          "Коннектор Google Places не подключён: отсутствует GOOGLE_PLACES_API_KEY.",
          ["GOOGLE_PLACES_API_KEY"]
        ),
      },
      { status: 202 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Тело запроса должно быть JSON.");
  }
  if (!body?.query || !body?.city) {
    return badRequest("Поля 'query' (ниша/ключевое слово) и 'city' (город) обязательны.");
  }

  let found;
  try {
    found = await fetchGooglePlacesLeads({ query: body.query, city: body.city, limit: body.limit });
  } catch (err: any) {
    return Response.json({ error: `Ошибка запроса к Google Places: ${err?.message ?? err}` }, { status: 502 });
  }

  let savedCount = 0;
  if (isDbConfigured() && found.length > 0) {
    const inputs: NewLeadInput[] = found.map((f) => ({
      company: f.company,
      category: body.query,
      city: f.city,
      address: f.address,
      trigger: "directory_only",
      triggerText: `Найден в Google Places по запросу "${body.query}" в городе ${f.city}.`,
      source: "Google Places",
      sourceUrl: f.website ?? undefined,
      contacts: { phone: f.phone ?? undefined, website: f.website ?? undefined },
    }));
    try {
      const created = await bulkInsertLeadsInDb(inputs);
      savedCount = created?.length ?? 0;
    } catch (err: any) {
      return Response.json(
        { triggered: true, found, foundCount: found.length, savedCount: 0, error: `Найдено, но не сохранено в БД: ${err?.message ?? err}` },
        { status: 207 }
      );
    }
  }

  return Response.json({
    triggered: true,
    found,
    foundCount: found.length,
    savedCount,
    meta: realMeta(
      isDbConfigured()
        ? `Реальный вызов Google Places выполнен. Найдено: ${found.length}, сохранено в Supabase как новые лиды: ${savedCount}.`
        : `Реальный вызов Google Places выполнен. Найдено: ${found.length}. БД не подключена — результаты не сохранены, только возвращены в ответе.`
    ),
  });
}
