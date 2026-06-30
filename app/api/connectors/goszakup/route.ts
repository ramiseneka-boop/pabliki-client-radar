import { sources } from "@/lib/sources";
import { pendingAccessMeta } from "@/app/api/_util/meta";

// GET /api/connectors/goszakup — статус коннектора Госзакупки KZ (goszakup.gov.kz).
// Требует GOSZAKUP_API_TOKEN — pending_access.
export async function GET() {
  const source = sources.find((s) => s.key === "goszakup");
  const requiredEnvVars = ["GOSZAKUP_API_TOKEN"];
  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);

  return Response.json({
    connector: source ?? null,
    requiredEnvVars,
    missingEnvVars,
    configured: missingEnvVars.length === 0,
    meta: pendingAccessMeta(
      "Коннектор Госзакупки KZ не подключён: отсутствует GOSZAKUP_API_TOKEN. Поиск тендеров/госзакупок на рекламные услуги не выполняется.",
      requiredEnvVars
    ),
  });
}
