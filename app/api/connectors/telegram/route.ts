import { sources } from "@/lib/sources";
import { pendingAccessMeta } from "@/app/api/_util/meta";

// GET /api/connectors/telegram — статус коннектора Telegram (каналы/бот).
// Требует TELEGRAM_BOT_TOKEN — pending_access.
export async function GET() {
  const source = sources.find((s) => s.key === "telegram");
  const requiredEnvVars = ["TELEGRAM_BOT_TOKEN"];
  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);

  return Response.json({
    connector: source ?? null,
    requiredEnvVars,
    missingEnvVars,
    configured: missingEnvVars.length === 0,
    meta: pendingAccessMeta(
      "Коннектор Telegram не подключён: отсутствует TELEGRAM_BOT_TOKEN. Сбор сигналов из Telegram-каналов и отправка сообщений через бота не выполняются.",
      requiredEnvVars
    ),
  });
}
