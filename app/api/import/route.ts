import { mockMeta, badRequest, fakeId } from "@/app/api/_util/meta";

// POST /api/import — загрузка CSV/Excel импорта лидов (заглушка).
// Принимает либо multipart/form-data (file), либо JSON с массивом rows —
// в обоих случаях ничего не парсится по-настоящему, просто валидируется форма запроса.
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  let rowCount = 0;

  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await req.formData();
      const file = form.get("file");
      if (!file) return badRequest("Поле 'file' обязательно в multipart/form-data.");
      rowCount = 0; // реального парсинга файла нет
    } catch {
      return badRequest("Не удалось разобрать multipart/form-data.");
    }
  } else {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return badRequest("Тело запроса должно быть JSON или multipart/form-data.");
    }
    if (!body || !Array.isArray(body.rows)) {
      return badRequest("Поле 'rows' (массив) обязательно в JSON-режиме.");
    }
    rowCount = body.rows.length;
  }

  return Response.json(
    {
      batchId: fakeId("IMP"),
      status: "queued",
      rowCountReceivedMock: rowCount,
      meta: mockMeta(
        "Импорт CSV/Excel — заглушка. Файл не парсится и строки не сохраняются. В проде: парсинг файла, запись в import_batches/import_rows, дедупликация через dedup_candidates, затем создание лидов."
      ),
    },
    { status: 202 }
  );
}
