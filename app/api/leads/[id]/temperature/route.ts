import { leads } from "@/lib/mock";
import { computeTemperature, temperatureMeta } from "@/lib/temperature";
import { mockMeta, notFound } from "@/app/api/_util/meta";

// GET /api/leads/:id/temperature — пересчёт температуры лида (time-decay)
// в реальном времени с помощью lib/temperature.ts.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден в mock-данных.`);

  const temperature = computeTemperature(lead.signalDate, lead.lastActivityAt, lead.trigger);

  return Response.json({
    leadId: lead.id,
    temperature,
    meta_ui: temperatureMeta[temperature],
    meta: mockMeta(
      "Температура пересчитывается реальной функцией lib/temperature.ts на основе signalDate/lastActivityAt из mock-лида. В проде источником будет поле leads.last_activity_at, обновляемое событиями из temperature_history."
    ),
  });
}
