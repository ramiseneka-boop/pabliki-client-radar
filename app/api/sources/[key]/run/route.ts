import { sources } from "@/lib/sources";
import { mockMeta, pendingAccessMeta, notFound, fakeId } from "@/app/api/_util/meta";

// POST /api/sources/:key/run — вручную запустить прогон источника.
// Статус ответа зависит от статуса коннектора в lib/sources.ts:
// активные/mock источники возвращают мок-успех, pending_access — честно сообщают,
// что доступа к внешнему API ещё нет.
export async function POST(_req: Request, { params }: { params: { key: string } }) {
  const source = sources.find((s) => s.key === params.key);
  if (!source) return notFound(`Источник с key="${params.key}" не найден в реестре lib/sources.ts.`);

  if (source.status === "pending_access") {
    return Response.json(
      {
        sourceKey: source.key,
        triggered: false,
        meta: pendingAccessMeta(
          `Источник "${source.name}" ждёт доступа к внешнему API и не может быть запущен реально.`,
          source.required_env_vars
        ),
      },
      { status: 202 }
    );
  }

  return Response.json({
    sourceKey: source.key,
    triggered: true,
    runId: fakeId("RUN"),
    newSignalsCountMock: Math.floor(Math.random() * 10),
    meta: mockMeta(
      `Запуск источника "${source.name}" — заглушка. Реальный прогон сбора сигналов не выполняется. В проде это поставит задачу воркеру коннектора и обновит sources.last_run_at / source_health_log.`
    ),
  });
}
