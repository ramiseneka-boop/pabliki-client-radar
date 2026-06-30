import { getEffectiveSources } from "@/lib/sources";
import { mockMeta } from "@/app/api/_util/meta";
import { isDbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/health — общая сводка состояния системы: агрегат по всем источникам
// (с реальным статусом на момент запроса) плюс перечень "инфраструктурных"
// зависимостей (БД, AI).
export async function GET() {
  const sources = getEffectiveSources();
  const bySourceStatus: Record<string, number> = {};
  for (const s of sources) {
    bySourceStatus[s.status] = (bySourceStatus[s.status] ?? 0) + 1;
  }

  const infra = [
    { name: "database", configured: isDbConfigured(), note: "Postgres/Supabase (lib/db.ts). Без SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY прототип работает только на in-memory mock-данных." },
    { name: "ai_messages", configured: !!process.env.OPENAI_API_KEY || !!process.env.ANTHROPIC_API_KEY, note: "Генерация сообщений/классификация ответов AI-моделью." },
  ];

  const overallStatus =
    sources.every((s) => s.status === "active") && infra.every((i) => i.configured)
      ? "healthy"
      : "degraded_mock_mode";

  return Response.json({
    overallStatus,
    sources: {
      total: sources.length,
      byStatus: bySourceStatus,
    },
    infra,
    meta: mockMeta(
      "Сводка здоровья системы — базовая конфигурация lib/sources.ts, статус пересчитан на момент запроса по факту переменных окружения (lib/sources.ts → getEffectiveSources, lib/db.ts → isDbConfigured)."
    ),
  });
}
