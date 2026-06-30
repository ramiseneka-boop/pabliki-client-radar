import { leads, lostReasonTaxonomy } from "@/lib/mock";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/analytics/lost-reasons — разбивка проигранных лидов по причинам.
export async function GET() {
  const counts: Record<string, number> = {};
  for (const l of leads) {
    if (l.status !== "rejected" || !l.lostReason) continue;
    counts[l.lostReason] = (counts[l.lostReason] ?? 0) + 1;
  }

  const breakdown = lostReasonTaxonomy.map((t) => ({
    key: t.key,
    label: t.label,
    count: counts[t.key] ?? 0,
  }));

  return Response.json({
    lostReasons: breakdown,
    meta: mockMeta(
      "Разбивка причин проигрыша считается на лету из mock-лидов (lib/mock.ts) по полю lostReason. В проде это будет COUNT(*) GROUP BY lost_reason из таблицы leads/deal_stage_history WHERE stage = 'lost'."
    ),
  });
}
