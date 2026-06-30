import { getQuickWinQueue } from "@/lib/mock";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/quick-wins — очередь "Quick Win": горячие/тёплые лиды с SLA в норме
// и высокой вероятностью сделки (вычисляется реальной функцией getQuickWinQueue из lib/mock.ts).
export async function GET() {
  const queue = getQuickWinQueue();

  return Response.json({
    leads: queue,
    total: queue.length,
    meta: mockMeta(
      "Очередь Quick Win вычисляется реальной функцией lib/mock.ts:getQuickWinQueue() над mock-лидами. В проде фильтрация будет идти прямо в SQL-запросе по leads/temperature_history/sla_events."
    ),
  });
}
