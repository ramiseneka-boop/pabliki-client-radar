// Вспомогательные проверки качества данных: уверенность источника и
// минимальная жизнеспособность лида перед попаданием в активную очередь.

import { MinimumViableLeadInput, MinimumViableLeadResult, SourceConnector } from "./types";

/**
 * Уверенность в сигнале конкретного источника (0..1) с учётом возраста сигнала.
 * Базовая надёжность источника затухает по мере старения сигнала — старые сигналы
 * от того же источника менее достоверны (могли устареть/измениться).
 */
export function computeSourceConfidence(source: SourceConnector, signalAgeHours: number): number {
  const base = Math.max(0, Math.min(1, source.reliability));

  let decay = 1;
  if (signalAgeHours <= 24) decay = 1;
  else if (signalAgeHours <= 72) decay = 0.9;
  else if (signalAgeHours <= 168) decay = 0.75;
  else if (signalAgeHours <= 720) decay = 0.55;
  else decay = 0.35;

  // Источники в статусе "mock"/"pending_access" по определению менее надёжны —
  // они ещё не подключены к реальным данным.
  const statusPenalty = source.status === "active" ? 1 : source.status === "mock" ? 0.85 : source.status === "pending_access" ? 0.5 : 0.3;

  return Math.round(base * decay * statusPenalty * 100) / 100;
}

/**
 * Проверяет, что лид содержит минимальный набор данных для попадания в активную
 * рабочую очередь менеджера: название компании, ниша/категория, город, хотя бы
 * один способ связи (или высокая уверенность идентичности компании), тип триггера
 * и источник.
 */
export function isMinimumViableLead(lead: MinimumViableLeadInput): MinimumViableLeadResult {
  const missing: string[] = [];

  if (!lead.company || !lead.company.trim()) missing.push("company");
  if (!lead.category || !lead.category.trim()) missing.push("category");
  if (!lead.city || !lead.city.trim()) missing.push("city");
  if (!lead.trigger || !lead.trigger.trim()) missing.push("trigger");
  if (!lead.source || !lead.source.trim()) missing.push("source");

  const hasContactMethod = !!(
    lead.contacts &&
    (lead.contacts.phone || lead.contacts.whatsapp || lead.contacts.instagram || lead.contacts.email || lead.contacts.website)
  );
  const hasHighConfidenceIdentity = lead.contactConfidence === "high";

  if (!hasContactMethod && !hasHighConfidenceIdentity) {
    missing.push("contact_method_or_high_confidence_identity");
  }

  return { valid: missing.length === 0, missing };
}
