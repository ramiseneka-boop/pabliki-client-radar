import { leads } from "@/lib/mock";
import { computeSlaStatus, slaDeadlineAt, slaStatusMeta } from "@/lib/sla";
import { mockMeta, notFound } from "@/app/api/_util/meta";

// GET /api/leads/:id/sla — пересчёт статуса SLA в реальном времени с помощью lib/sla.ts.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден в mock-данных.`);

  const slaStatus = computeSlaStatus(lead.signalDate, lead.trigger);
  const deadlineAt = slaDeadlineAt(lead.signalDate, lead.trigger);

  return Response.json({
    leadId: lead.id,
    slaStatus,
    slaDeadlineAt: deadlineAt,
    meta_ui: slaStatusMeta[slaStatus],
    meta: mockMeta(
      "SLA пересчитывается реальной функцией lib/sla.ts на основе signalDate из mock-лида (без учёта contactedAt, поскольку в моках нет журнала контактов). В проде contactedAt будет браться из sla_events."
    ),
  });
}
