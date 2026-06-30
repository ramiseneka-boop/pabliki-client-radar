// Money Priority Score — отдельная от Priority Score (lib/scoring.ts) метрика.
// Priority Score (1..100) отвечает "насколько лид качественный/правильно оформленный сигнал".
// Money Priority Score отвечает "сколько денег и насколько срочно мы рискуем потерять",
// то есть про приоритизацию очереди с точки зрения выручки агентства.

import { DealProbabilityInput, LeadTemperature, MoneyScoreBreakdown, MoneyScoreInput, SlaStatus } from "./types";

const TRIGGER_MONEY_WEIGHT: Record<string, number> = {
  real_estate_launch: 1.0, payment_abandoned: 0.9, selection_abandoned: 0.85,
  meta_active_ads: 0.8, new_branch: 0.75, new_venue: 0.7, enrollment: 0.6,
  reactivation: 0.6, tender: 0.65, promo: 0.55, seasonal: 0.5,
  site_request: 0.7, directory_only: 0.25,
};

const CONTACT_WEIGHT: Record<DealProbabilityInput["contactConfidence"], number> = {
  high: 1.0, medium: 0.6, low: 0.3, none: 0.05,
};

const BUDGET_WEIGHT: Record<DealProbabilityInput["budgetSignal"], number> = {
  high: 1.0, medium: 0.6, low: 0.3, none: 0.1,
};

/**
 * Вероятность закрытия сделки (0..1) — отдельное от Priority Score понятие,
 * основанное на уверенности контакта, признаках бюджета, силе триггера и денежности ниши.
 */
export function computeDealProbability(input: DealProbabilityInput): number {
  const triggerWeight = TRIGGER_MONEY_WEIGHT[input.triggerType] ?? 0.4;
  const contactWeight = CONTACT_WEIGHT[input.contactConfidence];
  const budgetWeight = BUDGET_WEIGHT[input.budgetSignal];
  const nicheWeight = Math.max(0, Math.min(1, input.nicheMoneyWeight));

  const raw =
    triggerWeight * 0.35 +
    contactWeight * 0.3 +
    budgetWeight * 0.2 +
    nicheWeight * 0.15;

  return Math.round(Math.max(0, Math.min(1, raw)) * 100) / 100;
}

const TEMPERATURE_URGENCY: Record<LeadTemperature, number> = {
  hot: 1.4,
  warming: 1.15,
  cooling: 0.9,
  cold: 0.6,
  expired: 0.2,
};

const SLA_URGENCY: Record<SlaStatus, number> = {
  on_time: 1.0,
  warning: 1.2,
  overdue: 1.4,
};

function urgencyMultiplier(temperature: LeadTemperature, slaStatus: SlaStatus): number {
  return Math.round(TEMPERATURE_URGENCY[temperature] * SLA_URGENCY[slaStatus] * 100) / 100;
}

/**
 * Money Priority Score = dealProbability × potentialDealSize × expectedMargin
 *   × urgencyMultiplier(temperature, sla) × inventoryFitScore
 *
 * Возвращает целое (тенге-подобная величина, не нормированная к 100) и разбивку
 * множителей для UI.
 */
export function computeMoneyPriorityScore(
  input: MoneyScoreInput
): { score: number; breakdown: MoneyScoreBreakdown } {
  const dealProbability = Math.max(0, Math.min(1, input.dealProbability));
  const expectedMargin = Math.max(0, Math.min(1, input.expectedMargin));
  const inventoryFitScore = Math.max(0, Math.min(1, input.inventoryFitScore));
  const um = urgencyMultiplier(input.temperature, input.slaStatus);

  const score = Math.round(
    dealProbability * input.potentialDealSize * expectedMargin * um * inventoryFitScore
  );

  const breakdown: MoneyScoreBreakdown = {
    dealProbability,
    potentialDealSize: input.potentialDealSize,
    expectedMargin,
    urgencyMultiplier: um,
    inventoryFitScore,
  };

  return { score, breakdown };
}
