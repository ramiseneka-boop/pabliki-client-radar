import { leads } from "@/lib/mock";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/workday/focus-next — "что делать следующим" для рабочего дня менеджера:
// берём лида с наибольшим moneyPriorityScore среди тех, что не в финальных статусах.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const manager = searchParams.get("manager");

  const FINAL_STATUSES = new Set(["rejected", "payment"]);
  let candidates = leads.filter((l) => !FINAL_STATUSES.has(l.status));
  if (manager) candidates = candidates.filter((l) => l.manager === manager);

  const next = [...candidates].sort(
    (a, b) => (b.moneyPriorityScore ?? 0) - (a.moneyPriorityScore ?? 0)
  )[0] ?? null;

  return Response.json({
    nextLead: next,
    reason: next
      ? "Наивысший Money Priority Score среди незакрытых лидов (mock-вычисление)."
      : "Нет доступных лидов под заданный фильтр.",
    meta: mockMeta(
      "Подбор следующего лида делается простой сортировкой по moneyPriorityScore из mock-данных. В проде это будет полноценный алгоритм 'Focus Next' с учётом SLA, рабочей загрузки менеджера и недавней активности."
    ),
  });
}
