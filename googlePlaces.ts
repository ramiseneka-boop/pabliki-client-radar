import { getEffectiveSources } from "@/lib/sources";
import { mockMeta, notFound } from "@/app/api/_util/meta";

export const dynamic = "force-dynamic";

// GET /api/sources/:key/health — состояние конкретного коннектора (реальный
// статус на момент запроса — см. lib/sources.ts → getEffectiveSources).
export async function GET(_req: Request, { params }: { params: { key: string } }) {
  const source = getEffectiveSources().find((s) => s.key === params.key);
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
      "Health-статус: базовая конфигурация lib/sources.ts + пересчёт по факту переменных окружения. Полноценного source_health_log (история запусков, ошибки, латентность) пока нет."
    ),
  });
}
