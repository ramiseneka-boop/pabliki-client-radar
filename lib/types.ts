// Расширенная доменная модель Pabliki Client Radar.
// Это аддитивный слой над lib/mock.ts / lib/scoring.ts — ничего из существующих
// экспортов не переименовывается и не удаляется.

// ---------- Температура лида (time-decay) ----------

export type LeadTemperature = "hot" | "warming" | "cooling" | "cold" | "expired";

// ---------- SLA ----------

export type SlaStatus = "on_time" | "warning" | "overdue";

// ---------- Источники сигналов ----------

export type SourceConnectorStatus = "active" | "mock" | "pending_access" | "error" | "disabled";
export type SourceConnectorMode = "auto" | "semi" | "manual";

export type SourceConnector = {
  key: string;
  name: string;
  category: string;
  status: SourceConnectorStatus;
  mode: SourceConnectorMode;
  reliability: number; // 0..1
  last_run_at: string | null;
  next_run_at: string | null;
  required_env_vars: string[];
  count: number;
  notes?: string;
};

// ---------- Offer Testing Lab ----------

export type OfferStatus = "testing" | "winner" | "retired";

export type Offer = {
  id: string;
  name: string;
  niche: string;
  channel: string;
  packageDescription: string;
  priceFrom: number;
  priceTo: number;
  conversionRateMock: number; // 0..1
  sampleSize: number;
  status: OfferStatus;
};

// ---------- Скрипты продаж ----------

export type SalesScript = {
  id: string;
  triggerType: string;
  niche?: string;
  situation: string;
  scriptText: string;
  objectionHandled?: string;
};

// ---------- Классификация ответов ----------

export type ReplyClassificationLabel =
  | "interested"
  | "objection_price"
  | "objection_timing"
  | "not_interested"
  | "wrong_contact"
  | "already_client"
  | "needs_followup";

export type ReplyClassification = {
  id: string;
  leadId: string;
  replyText: string;
  classification: ReplyClassificationLabel;
  suggestedNextAction: string;
};

// ---------- Do-Not-Contact ----------

export type DoNotContact = {
  bin?: string;
  phone?: string;
  reason: string;
  addedAt: string;
};

// ---------- Причины проигрыша ----------

export type LostReason =
  | "price"
  | "timing"
  | "competitor"
  | "no_budget"
  | "no_response"
  | "not_decision_maker"
  | "other";

export const lostReasonTaxonomy: { key: LostReason; label: string }[] = [
  { key: "price", label: "Дорого" },
  { key: "timing", label: "Не вовремя / не сейчас" },
  { key: "competitor", label: "Ушли к конкуренту" },
  { key: "no_budget", label: "Нет бюджета" },
  { key: "no_response", label: "Не отвечает" },
  { key: "not_decision_maker", label: "Не ЛПР" },
  { key: "other", label: "Другое" },
];

// ---------- Money Priority Score ----------

export type MoneyScoreInput = {
  dealProbability: number;      // 0..1
  potentialDealSize: number;    // тенге
  expectedMargin: number;       // 0..1
  temperature: LeadTemperature;
  slaStatus: SlaStatus;
  inventoryFitScore: number;    // 0..1
};

export type MoneyScoreBreakdown = {
  dealProbability: number;
  potentialDealSize: number;
  expectedMargin: number;
  urgencyMultiplier: number;
  inventoryFitScore: number;
};

export type DealProbabilityInput = {
  contactConfidence: "high" | "medium" | "low" | "none";
  budgetSignal: "high" | "medium" | "low" | "none";
  triggerType: string;
  nicheMoneyWeight: number; // 0..1
};

// ---------- Минимально жизнеспособный лид ----------

export type MinimumViableLeadInput = {
  company?: string;
  category?: string;
  city?: string;
  trigger?: string;
  source?: string;
  contacts?: { phone?: string; whatsapp?: string; instagram?: string; email?: string; website?: string };
  contactConfidence?: "high" | "medium" | "low" | "none";
};

export type MinimumViableLeadResult = {
  valid: boolean;
  missing: string[];
};

// ---------- Менеджерский коучинг ----------

export type ManagerCoachingStats = {
  manager: string;
  avgResponseTimeMinutes: number;
  conversionRate: number; // 0..1
  leadsHandled: number;
  scoreVsTeamAvg: number; // % разница, может быть отрицательным
};

// ---------- Founder Control Center ----------

export type FounderControlCenterStats = {
  hotLeadsToday: number;
  leadsAtSlaRisk: number;
  moneyPipelineTotal: number;
  topMoneyPriorityLeadIds: string[];
  managerLeaderboard: ManagerCoachingStats[];
};
