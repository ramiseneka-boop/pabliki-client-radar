import { pendingAccessMeta } from "@/app/api/_util/meta";

// GET /api/connectors/whatsapp — статус коннектора WhatsApp Business API.
// Требует WHATSAPP_BUSINESS_TOKEN — pending_access.
export async function GET() {
  const requiredEnvVars = ["WHATSAPP_BUSINESS_TOKEN"];
  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);

  return Response.json({
    connector: { key: "whatsapp", name: "WhatsApp Business API" },
    requiredEnvVars,
    missingEnvVars,
    configured: missingEnvVars.length === 0,
    meta: pendingAccessMeta(
      "Коннектор WhatsApp Business API не подключён: отсутствует WHATSAPP_BUSINESS_TOKEN. Отправка сообщений (см. /api/leads/[id]/messages) — только симуляция.",
      requiredEnvVars
    ),
  });
}
