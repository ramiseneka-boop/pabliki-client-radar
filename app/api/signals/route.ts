import { leads } from "@/lib/mock";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/signals — лента входящих сигналов. У нас нет отдельной таблицы
// сигналов в lib/mock.ts, поэтому проецируем их из лидов (signalDate/trigger/source),
// что соответствует будущей таблице signals (один лид может быть создан из 1..N сигналов).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");

  let signals = leads.map((l) => ({
    id: `SIG-${l.id}`,
    leadId: l.id,
    company: l.company,
    trigger: l.trigger,
    triggerText: l.triggerText,
    source: l.source,
    sourceUrl: l.sourceUrl,
    signalDate: l.signalDate,
    city: l.city,
  }));

  if (source) signals = signals.filter((s) => s.source === source);

  return Response.json({
    signals,
    total: signals.length,
    meta: mockMeta(
      "Сигналы спроецированы из mock-лидов (lib/mock.ts), отдельной таблицы сигналов в прототипе нет. В проде сигналы будут отдельной сущностью (таблица signals), один лид может агрегировать несколько сигналов."
    ),
  });
}
