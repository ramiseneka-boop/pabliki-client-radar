import { leads } from "@/lib/mock";
import { pendingAccessMeta } from "@/app/api/_util/meta";

// GET /api/analytics/revenue-attribution — атрибуция выручки по источникам/триггерам.
// Реальных данных по оплатам нет (нет интеграции с платёжной системой/CRM сделок),
// поэтому это pending_access: цифры построены из potentialDealSize как грубая оценка,
// а не из факта оплаты.
export async function GET() {
  const bySource: Record<string, number> = {};
  for (const l of leads) {
    if (l.status !== "payment") continue;
    bySource[l.source] = (bySource[l.source] ?? 0) + (l.potentialDealSize ?? 0);
  }

  return Response.json({
    revenueBySourceEstimate: bySource,
    note: "Оценка построена на potentialDealSize лидов со статусом 'payment', НЕ на реальных платёжных данных.",
    meta: pendingAccessMeta(
      "Реальной атрибуции выручки нет: нет интеграции с платёжной системой/биллингом агентства. Цифры — грубая оценка по mock-полю potentialDealSize. В проде: join deals + revenue_attribution + payments по closed-won сделкам."
    ),
  });
}
