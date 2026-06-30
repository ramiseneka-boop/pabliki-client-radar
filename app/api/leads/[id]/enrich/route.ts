import { leads } from "@/lib/mock";
import { pendingAccessMeta, notFound, fakeId } from "@/app/api/_util/meta";

// POST /api/leads/:id/enrich — триггер пайплайна обогащения лида
// (поиск доп. контактов, проверка БИН, поиск сайта/инстаграма через внешние API).
// Все реальные источники обогащения (Google Places, 2GIS) ждут доступа,
// поэтому это pending_access-заглушка.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден в mock-данных.`);

  return Response.json(
    {
      jobId: fakeId("ENRICH"),
      leadId: lead.id,
      status: "queued",
      plannedSteps: [
        "lookup_bin_registry",
        "lookup_google_places",
        "lookup_2gis_card",
        "lookup_social_profiles",
      ],
      meta: pendingAccessMeta(
        "Пайплайн обогащения лида — заглушка. Реальные шаги (Google Places, 2GIS, реестр БИН) требуют внешних API-ключей и не выполняются. В проде это будет асинхронная задача (enrichment_jobs) с воркером.",
        ["GOOGLE_PLACES_API_KEY", "TWOGIS_API_KEY"]
      ),
    },
    { status: 202 }
  );
}

// GET /api/leads/:id/enrich — статус последней задачи обогащения (мок).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return notFound(`Лид с id=${params.id} не найден в mock-данных.`);

  return Response.json({
    leadId: lead.id,
    lastJob: null,
    meta: pendingAccessMeta(
      "История задач обогащения отсутствует — функция ещё не подключена к реальным источникам. В проде: SELECT из enrichment_jobs WHERE lead_id = :id ORDER BY created_at DESC LIMIT 1.",
      ["GOOGLE_PLACES_API_KEY", "TWOGIS_API_KEY"]
    ),
  });
}
