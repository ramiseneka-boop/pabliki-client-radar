import { sources } from "@/lib/sources";
import { pendingAccessMeta } from "@/app/api/_util/meta";

// GET /api/connectors/google-places — статус и конфигурация коннектора Google Places.
// Требует GOOGLE_PLACES_API_KEY, которого пока нет — pending_access.
export async function GET() {
  const source = sources.find((s) => s.key === "google_places");
  const requiredEnvVars = ["GOOGLE_PLACES_API_KEY"];
  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);

  return Response.json({
    connector: source ?? null,
    requiredEnvVars,
    missingEnvVars,
    configured: missingEnvVars.length === 0,
    meta: pendingAccessMeta(
      "Коннектор Google Places не подключён: отсутствует GOOGLE_PLACES_API_KEY. Реальные вызовы Places API не выполняются.",
      requiredEnvVars
    ),
  });
}
