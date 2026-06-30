// SLA (контроль скорости реакции) — отдельный от температуры лида слой:
// температура отвечает «насколько остыл сигнал», SLA отвечает «успели ли мы
// отреагировать в нужное окно с момента сигнала».

import { SlaStatus } from "./types";

// Сколько часов даётся менеджеру на первый контакт по типу триггера,
// прежде чем лид считается просроченным (warning срабатывает на 60% от дедлайна).
const SLA_DEADLINE_HOURS: Record<string, number> = {
  payment_abandoned: 4,
  selection_abandoned: 12,
  site_request: 8,
  meta_active_ads: 48,
  real_estate_launch: 24,
  new_branch: 24,
  new_venue: 24,
  enrollment: 36,
  promo: 24,
  seasonal: 48,
  reactivation: 24,
  tender: 72,
  directory_only: 72,
};

const DEFAULT_DEADLINE_HOURS = 48;

export function slaDeadlineHours(triggerType: string): number {
  return SLA_DEADLINE_HOURS[triggerType] ?? DEFAULT_DEADLINE_HOURS;
}

function hoursSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, ms / (1000 * 60 * 60));
}

/**
 * Вычисляет статус SLA. Если есть contactedAt — значит контакт уже состоялся
 * и лид считается on_time (SLA выполнен), независимо от того, сколько прошло времени.
 */
export function computeSlaStatus(
  signalDate: string,
  triggerType: string,
  contactedAt?: string
): SlaStatus {
  if (contactedAt) return "on_time";

  const deadline = slaDeadlineHours(triggerType);
  const ageHours = hoursSince(signalDate);
  const warningThreshold = deadline * 0.6;

  if (ageHours <= warningThreshold) return "on_time";
  if (ageHours <= deadline) return "warning";
  return "overdue";
}

export function slaDeadlineAt(signalDate: string, triggerType: string): string {
  const deadline = slaDeadlineHours(triggerType);
  const date = new Date(signalDate);
  date.setHours(date.getHours() + deadline);
  return date.toISOString();
}

export const slaStatusMeta: Record<SlaStatus, { label: string; badge: string }> = {
  on_time: { label: "В срок", badge: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
  warning: { label: "Скоро просрочка", badge: "bg-amber-50 text-amber-600 ring-amber-200" },
  overdue: { label: "Просрочено", badge: "bg-red-50 text-red-600 ring-red-200" },
};
