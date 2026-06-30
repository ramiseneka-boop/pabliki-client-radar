import { leads } from "@/lib/mock";
import { computePriorityScore } from "@/lib/scoring";
import { computeDealProbability, computeMoneyPriorityScore } from "@/lib/moneyScore";
import { mockMeta, notFound } from "@/app/api/_util/meta";

// GET /api/leads/:id/score — пересчёт Priority Score и Money Priority Score
// "на лету" с помощью реальных детерминированных функций из lib/scoring.ts и
// lib/moneyScore.ts (логика реальная, входные данные — из mock-лида).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден в mock-данных.`);

  const signalAgeHours = Math.max(
    0,
    (Date.now() - new Date(lead.signalDate).getTime()) / (1000 * 60 * 60)
  );

  const priority = computePriorityScore({
    triggerType: lead.trigger,
    nicheMoneyWeight: 0.6,
    contactConfidence: lead.contactConfidence,
    geoWeight: 0.8,
    budgetSignal: lead.budgetMax >= 1000000 ? "high" : lead.budgetMax >= 400000 ? "medium" : "low",
    signalAgeHours,
    sourceReliability: lead.sourceConfidence ?? 0.6,
  });

  const dealProbability = computeDealProbability({
    contactConfidence: lead.contactConfidence,
    budgetSignal: lead.budgetMax >= 1000000 ? "high" : lead.budgetMax >= 400000 ? "medium" : "low",
    triggerType: lead.trigger,
    nicheMoneyWeight: 0.6,
  });

  const moneyScore =
    lead.temperature && lead.slaStatus
      ? computeMoneyPriorityScore({
          dealProbability,
          potentialDealSize: lead.potentialDealSize ?? lead.budgetMax,
          expectedMargin: lead.expectedMargin ?? 0.35,
          temperature: lead.temperature,
          slaStatus: lead.slaStatus,
          inventoryFitScore: 0.7,
        })
      : null;

  return Response.json({
    leadId: lead.id,
    priorityScore: priority,
    moneyPriorityScore: moneyScore,
    meta: mockMeta(
      "Пересчёт выполняется реальными функциями lib/scoring.ts и lib/moneyScore.ts, но часть входных параметров (nicheMoneyWeight, geoWeight, inventoryFitScore) — временные дефолты, а не значения из таблиц categories/cities. В проде эти веса будут читаться из БД."
    ),
  });
}
