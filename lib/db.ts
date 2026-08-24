// Minimal database configuration helper used by health endpoints.
// This project currently has no server-side Postgres driver dependency, so this
// module intentionally only reports configuration readiness and never exposes
// or logs credentials.

export function isDbConfigured() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serverKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && serverKey);
}
