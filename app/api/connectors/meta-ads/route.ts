import { sources } from "@/lib/sources";
import { pendingAccessMeta } from "@/app/api/_util/meta";

// GET /api/connectors/meta-ads — статус и конфигурация коннектора Meta Ad Library.
// Требует META_ACCESS_TOKEN и META_AD_ACCOUNT_ID — pending_access.
export async function GET() {
  const source = sources.find((s) => s.key === "meta_ads");
  const requiredEnvVars = ["META_ACCESS_TOKEN", "META_AD_ACCOUNT_ID"];
  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);

  return Response.json({
    connector: source ?? null,
    requiredEnvVars,
    missingEnvVars,
    configured: missingEnvVars.length === 0,
    meta: pendingAccessMeta(
      "Коннектор Meta Ad Library не подключён: отсутствуют META_ACCESS_TOKEN/META_AD_ACCOUNT_ID. Реальные вызовы Meta Marketing API не выполняются.",
      requiredEnvVars
    ),
  });
}
