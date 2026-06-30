import { leads, tasksToday, dashboardMetrics } from "@/lib/mock";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/workday/summary — сводка рабочего дня (для виджета на дашборде/топбаре).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const manager = searchParams.get("manager");

  const myLeads = manager ? leads.filter((l) => l.manager === manager) : leads;
  const myTasks = manager ? tasksToday.filter((t) => t.manager === manager) : tasksToday;

  return Response.json({
    manager: manager ?? "all",
    leadsAssigned: myLeads.length,
    tasksToday: myTasks.length,
    hotLeads: myLeads.filter((l) => l.temperature === "hot").length,
    overdueLeads: myLeads.filter((l) => l.slaStatus === "overdue").length,
    dashboardMetrics,
    meta: mockMeta(
      "Сводка рабочего дня агрегируется на лету из mock-данных (lib/mock.ts). В проде это будет materialized view/агрегация по workday_sessions + tasks + leads за текущий день."
    ),
  });
}
