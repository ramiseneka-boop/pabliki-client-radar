// Общий хелпер для API route stubs (app/api/**).
// НЕ относится к lib/ — это инфраструктурный слой только для API-заглушек.
// Каждый ответ API должен включать meta.status, чтобы фронтенд/интеграторы
// явно видели, что эндпоинт не подключён к реальному бэкенду.

export type MockMeta = {
  status: "mock" | "pending_access";
  note: string;
  required_env_vars?: string[];
};

export function mockMeta(note: string, requiredEnvVars?: string[]): MockMeta {
  return {
    status: "mock",
    note,
    ...(requiredEnvVars && requiredEnvVars.length ? { required_env_vars: requiredEnvVars } : {}),
  };
}

export function pendingAccessMeta(note: string, requiredEnvVars?: string[]): MockMeta {
  return {
    status: "pending_access",
    note,
    ...(requiredEnvVars && requiredEnvVars.length ? { required_env_vars: requiredEnvVars } : {}),
  };
}

/** Унифицированный конверт ошибки 404 для /leads/[id] и аналогичных роутов. */
export function notFound(message: string) {
  return Response.json({ error: message }, { status: 404 });
}

/** Унифицированный конверт ошибки 400 для POST/PATCH с некорректным телом. */
export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

/** Безопасный парсинг JSON-тела запроса (POST/PATCH), не бросает исключение. */
export async function safeJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    if (body && typeof body === "object") return body as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}

/** Фейковый id для "созданных" сущностей в POST-заглушках (никуда не сохраняется). */
export function fakeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
