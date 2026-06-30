import { sources } from "@/lib/sources";
import { pendingAccessMeta } from "@/app/api/_util/meta";

// GET /api/connectors/2gis — статус и конфигурация коннектора 2GIS.
// Требует TWOGIS_API_KEY, которого пока нет — pending_access.
export async function GET() {
  const source = sources.find((s) => s.key === "2gis");
  const requiredEnvVars = ["TWOGIS_API_KEY"];
  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);

  return Response.json({
    connector: source ?? null,
    requiredEnvVars,
    missingEnvVars,
    configured: missingEnvVars.length === 0,
    meta: pendingAccessMeta(
      "Коннектор 2GIS не подключён: отсутствует TWOGIS_API_KEY. Реальные вызовы 2GIS API не выполняются.",
      requiredEnvVars
    ),
  });
}
