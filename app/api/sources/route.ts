import { sources } from "@/lib/sources";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/sources — реестр источников сигналов (коннекторов) из lib/sources.ts.
export async function GET() {
  return Response.json({
    sources,
    total: sources.length,
    meta: mockMeta(
      "Реестр источников отдаётся из lib/sources.ts (статичный конфиг). В проде это будет таблица sources/integration_status с реальными last_run_at/health, обновляемыми воркерами коннекторов."
    ),
  });
}
