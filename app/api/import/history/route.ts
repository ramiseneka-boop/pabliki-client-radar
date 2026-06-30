import { mockMeta } from "@/app/api/_util/meta";

// GET /api/import/history — история импортов (мок: пустая история + один пример).
export async function GET() {
  const history = [
    {
      batchId: "IMP-demo1",
      fileName: "old_clients_2026_05.xlsx",
      status: "completed",
      rowCount: 31,
      createdRows: 28,
      duplicateRows: 3,
      createdAt: "2026-06-20T11:00:00+06:00",
    },
  ];

  return Response.json({
    history,
    meta: mockMeta(
      "История импортов — захардкоженный пример, не реальный журнал. В проде: SELECT из import_batches ORDER BY created_at DESC с агрегатами по import_rows."
    ),
  });
}
