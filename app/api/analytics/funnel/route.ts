import { funnel } from "@/lib/mock";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/analytics/funnel — конверсионная воронка (статусы лидов).
export async function GET() {
  return Response.json({
    funnel,
    meta: mockMeta(
      "Воронка отдаётся из lib/mock.ts (статичные числа по этапам). В проде это будет COUNT(*) GROUP BY status из таблицы leads/deal_stage_history за выбранный период."
    ),
  });
}
