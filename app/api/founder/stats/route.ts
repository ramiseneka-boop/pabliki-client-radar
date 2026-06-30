import { founderControlCenterStats } from "@/lib/mock";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/founder/stats — статистика для Founder Control Center.
export async function GET() {
  return Response.json({
    stats: founderControlCenterStats,
    meta: mockMeta(
      "Статистика founder control center вычисляется из mock-лидов в lib/mock.ts (founderControlCenterStats). В проде это будет агрегация по leads/deals/manager_coaching_stats в реальном времени."
    ),
  });
}
