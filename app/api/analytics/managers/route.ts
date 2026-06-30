import { managerCoachingStats } from "@/lib/mock";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/analytics/managers — коучинг-статистика по менеджерам (для лидерборда).
export async function GET() {
  return Response.json({
    managers: managerCoachingStats,
    meta: mockMeta(
      "Статистика менеджеров отдаётся из lib/mock.ts (managerCoachingStats). В проде это будет агрегация по таблицам tasks/leads/sla_events с расчётом avgResponseTime и conversionRate за период, материализованная в manager_coaching_stats."
    ),
  });
}
