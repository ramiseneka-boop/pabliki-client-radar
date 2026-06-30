import { sources } from "@/lib/sources";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/health — общая сводка состояния системы: агрегат по всем источникам
// из lib/sources.ts плюс перечень "инфраструктурных" зависимостей (БД, AI),
// которые в прототипе не настроены вовсе.
export async function GET() {
  const bySourceStatus: Record<string, number> = {};
  for (const s of sources) {
    bySourceStatus[s.status] = (bySourceStatus[s.status] ?? 0) + 1;
  }

  const infra = [
    { name: "database", configured: !!process.env.DATABASE_URL, note: "Postgres/Supabase. Без DATABASE_URL прототип работает только на in-memory mock-данных." },
    { name: "supabase", configured: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY, note: "Supabase проект для будущей миграции с db/schema.sql." },
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
      "Сводка здоровья системы — агрегат по статичному lib/sources.ts плюс проверка переменных окружения текущего процесса. В проде: реальные health-чеки коннекторов + БД + внешних API, записываемые в source_health_log / integration_status."
    ),
  });
}
