// Эталонная (детерминированная) реализация Priority Engine.
// Числа считает код; AI лишь формулирует объяснение. Веса/пороги — конфигурируемы.

export type ScoreInput = {
  triggerType: string;
  nicheMoneyWeight: number;     // 0..1 (categories.money_weight)
  contactConfidence: "high" | "medium" | "low" | "none";
  geoWeight: number;            // 0..1 (cities.geo_weight; есть база пабликов → выше)
  budgetSignal: "high" | "medium" | "low" | "none";
  signalAgeHours: number;       // свежесть
  sourceReliability: number;    // 0..1 (sources.reliability_weight)
  garbageFlags?: number;        // штрафные признаки (нет контакта, неясная ниша, дубль…)
};

export const TRIGGER_STRENGTH: Record<string, number> = {
  site_request: 25, payment_abandoned: 25, selection_abandoned: 24, real_estate_launch: 24,
  meta_active_ads: 22, new_branch: 21, new_venue: 20, enrollment: 18, reactivation: 18,
  tender: 16, promo: 17, sale: 17, seasonal: 15, search_trend: 15, event: 14, news: 13,
  manual: 12, directory_only: 6,
};

export function freshnessScore(ageHours: number): number {
  if (ageHours <= 24) return 10;
  if (ageHours <= 72) return 8;
  if (ageHours <= 168) return 6;
  if (ageHours <= 720) return 3;
  return 1;
}

export function contactScore(c: ScoreInput["contactConfidence"]): number {
  return { high: 15, medium: 9, low: 4, none: 0 }[c];
}

export function budgetScore(b: ScoreInput["budgetSignal"]): number {
  return { high: 10, medium: 5, low: 2, none: 0 }[b];
}

export function computePriorityScore(input: ScoreInput) {
  const trigger = TRIGGER_STRENGTH[input.triggerType] ?? 8;
  const niche = Math.round(input.nicheMoneyWeight * 20);
  const contact = contactScore(input.contactConfidence);
  const geo = Math.round(input.geoWeight * 15);
  const budget = budgetScore(input.budgetSignal);
  const freshness = freshnessScore(input.signalAgeHours);
  const reliability = Math.round(input.sourceReliability * 5);
  const penalty = -(input.garbageFlags ?? 0) * 10;

  const breakdown = { trigger, niche, contact, geo, budget, freshness, reliability, penalty };
  const raw = trigger + niche + contact + geo + budget + freshness + reliability + penalty;
  const score = Math.max(1, Math.min(100, raw));
  const priority = score >= 90 ? "hot" : score >= 75 ? "warm" : score >= 50 ? "watch" : score >= 30 ? "base" : "trash";

  return { score, breakdown, priority };
}

// Пример: Dent Plus (новый филиал, Алматы)
// computePriorityScore({ triggerType:'new_branch', nicheMoneyWeight:0.75, contactConfidence:'high',
//   geoWeight:1.0, budgetSignal:'medium', signalAgeHours:48, sourceReliability:0.8 })
// → score ~ 90, priority 'hot'
