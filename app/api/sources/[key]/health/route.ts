import { sources } from "@/lib/sources";
import { mockMeta, notFound } from "@/app/api/_util/meta";

// GET /api/sources/:key/health — состояние конкретного коннектора.
export async function GET(_req: Request, { params }: { params: { key: string } }) {
  const source = sources.find((s) => s.key === params.key);
  if (!source) return notFound(`Источник с key="${params.key}" не найден в реестре lib/sources.ts.`);

  return Response.json({
    sourceKey: source.key,
    status: source.status,
    reliability: source.reliability,
    lastRunAt: source.last_run_at,
    nextRunAt: source.next_run_at,
    requiredEnvVars: source.required_env_vars,
    missingEnvVars: source.required_env_vars.filter((v) => !process.env[v]),
    meta: mockMeta(
      "Health-статус читается из статичного конфига lib/sources.ts, а не из реального мониторинга. В проде это будет агрегат из source_health_log (последние N запусков, ошибки, латентность)."
    ),
  });
}
