import { salesScripts } from "@/lib/mock";
import { mockMeta } from "@/app/api/_util/meta";

// GET /api/scripts — библиотека скриптов продаж, с фильтрами по triggerType/niche.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const triggerType = searchParams.get("triggerType");
  const niche = searchParams.get("niche");

  let result = salesScripts;
  if (triggerType) result = result.filter((s) => s.triggerType === triggerType || s.triggerType === "any");
  if (niche) result = result.filter((s) => !s.niche || s.niche === niche);

  return Response.json({
    scripts: result,
    total: result.length,
    meta: mockMeta(
      "Скрипты продаж отдаются из lib/mock.ts (статичная библиотека). В проде это будет таблица sales_scripts с usage-статистикой из script_usage."
    ),
  });
}
