// Температура лида — time-decay модель.
// Чем «горячее» и быстрее протухающий триггер, тем уже окно до остывания.
// Используется отдельно от Priority Score (lib/scoring.ts) — это про срочность во времени,
// а не про денежность/качество лида.

import { LeadTemperature } from "./types";

// Длительность окон в часах для каждой стадии по типу триггера.
// [hot, warming, cooling, cold] — после cold окна лид считается expired.
const DECAY_WINDOWS: Record<string, [number, number, number, number]> = {
  payment_abandoned: [6, 24, 48, 96],
  selection_abandoned: [12, 36, 72, 144],
  site_request: [12, 36, 72, 144],
  meta_active_ads: [48, 168, 336, 720],
  real_estate_launch: [72, 240, 480, 960],
  new_branch: [72, 240, 480, 960],
  new_venue: [72, 240, 480, 960],
  enrollment: [72, 240, 480, 960],
  promo: [48, 168, 336, 720],
  seasonal: [120, 360, 720, 1440],
  reactivation: [72, 240, 480, 960],
  tender: [120, 360, 720, 1440],
  directory_only: [168, 480, 960, 1920],
};

const DEFAULT_WINDOW: [number, number, number, number] = [72, 240, 480, 960];

function hoursSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, ms / (1000 * 60 * 60));
}

/**
 * Вычисляет температуру лида на основе давности сигнала (и, если есть,
 * последней активности по лиду — она «освежает» отсчёт времени).
 */
export function computeTemperature(
  signalDate: string,
  lastActivityAt?: string,
  triggerType?: string
): LeadTemperature {
  const referenceDate = lastActivityAt ?? signalDate;
  const ageHours = hoursSince(referenceDate);
  const [hot, warming, cooling, cold] = (triggerType && DECAY_WINDOWS[triggerType]) || DEFAULT_WINDOW;

  if (ageHours <= hot) return "hot";
  if (ageHours <= warming) return "warming";
  if (ageHours <= cooling) return "cooling";
  if (ageHours <= cold) return "cold";
  return "expired";
}

export const temperatureMeta: Record<LeadTemperature, { label: string; badge: string; dot: string }> = {
  hot: { label: "Горячий", badge: "bg-red-100 text-red-700 ring-red-200", dot: "bg-red-500" },
  warming: { label: "Тёплый", badge: "bg-amber-100 text-amber-700 ring-amber-200", dot: "bg-amber-400" },
  cooling: { label: "Остывает", badge: "bg-sky-100 text-sky-700 ring-sky-200", dot: "bg-sky-400" },
  cold: { label: "Холодный", badge: "bg-slate-100 text-slate-500 ring-slate-200", dot: "bg-slate-300" },
  expired: { label: "Просрочен", badge: "bg-slate-200 text-slate-400 ring-slate-300", dot: "bg-slate-200" },
};
