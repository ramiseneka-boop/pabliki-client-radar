import { getEffectiveSources } from "@/lib/sources";
import { mockMeta } from "@/app/api/_util/meta";

export const dynamic = "force-dynamic";

// GET /api/sources — реестр источников сигналов (коннекторов) из lib/sources.ts,
// с реальным статусом на момент запроса (getEffectiveSources учитывает, какие
// переменные окружения реально заданы и для каких коннекторов есть рабочий код).
export async function GET() {
  const sources = getEffectiveSources();
  return Response.json({
    sources,
    total: sources.length,
    meta: mockMeta(
      "Реестр источников: базовая конфигурация из lib/sources.ts, статус пересчитан на момент запроса по факту наличия переменных окружения и реализации (lib/sources.ts → getEffectiveSources)."
    ),
  });
}
