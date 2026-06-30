import { sourcesBreakdown } from "@/lib/mock";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/analytics/sources — разбивка лидов по источникам.
export async function GET() {
  return Response.json({
    sourcesBreakdown,
    meta: mockMeta(
      "Разбивка по источникам отдаётся из lib/mock.ts (статичные числа). В проде это будет COUNT(*) GROUP BY source_key из таблицы leads/signals за период, с учётом source_health_log."
    ),
  });
}
