import { COMPANY_TEMPLATES, SEGMENT_TEMPLATES } from "./auctionSeed";

export type AuctionSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  user: { id: string; email?: string };
};

export type AuctionSegment = {
  id: string;
  user_id: string;
  code: string;
  name: string;
  priority: number;
  software: string;
  thesis: string;
  benchmark: string;
  migration_ease: number;
  build_ease: number;
  status: "testing" | "winner" | "paused" | "rejected";
  created_at: string;
  updated_at: string;
};

export type AuctionCompany = {
  id: string;
  user_id: string;
  segment_id: string;
  name: string;
  website: string;
  city: string;
  tier: "A" | "B" | "C";
  stage: string;
  current_software: string;
  evidence_url: string;
  evidence_note: string;
  evidence_confidence: "high" | "medium" | "low";
  estimated_users: number | null;
  estimated_tco_kzt: number | null;
  actual_tco_kzt: number | null;
  renewal_date: string | null;
  decision_maker_name: string;
  decision_maker_role: string;
  decision_maker_contact: string;
  pain: string;
  must_keep: string;
  why_now: string;
  next_action: string;
  next_action_date: string | null;
  proposed_price_kzt: number | null;
  deposit_kzt: number | null;
  won_value_kzt: number | null;
  lost_reason: string;
  competitor_confirmed: boolean;
  dm_conversation: boolean;
  invoice_seen: boolean;
  demo_committed: boolean;
  migration_data_committed: boolean;
  deposit_committed: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type AuctionActivity = {
  id: string;
  user_id: string;
  company_id: string;
  activity_type: string;
  note: string;
  created_at: string;
};

const SESSION_KEY = "software-auction-session-v1";
const FALLBACK_SUPABASE_URL = "https://ilosellimgqkjxjlixxj.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7rzdvvtJepEW9KngVocONw_Xl8SJUvt";

function config() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL).replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_PUBLISHABLE_KEY;
  return { url, anonKey };
}

async function parseResponse(res: Response) {
  if (res.status === 204) return null;
  const text = await res.text();
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!res.ok) {
    const message = body?.msg || body?.message || body?.error_description || body?.error || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return body;
}

export function storeSession(session: AuctionSession | null) {
  if (typeof window === "undefined") return;
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function readStoredSession(): AuctionSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuctionSession) : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

async function authRequest(path: string, body: unknown) {
  const { url, anonKey } = config();
  const res = await fetch(`${url}/auth/v1/${path}`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

function normalizeSession(data: any): AuctionSession | null {
  if (!data?.access_token || !data?.refresh_token || !data?.user?.id) return null;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: Number(data.expires_in || 3600),
    expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
    user: { id: data.user.id, email: data.user.email },
  };
}

export async function signInAuction(email: string, password: string) {
  const data = await authRequest("token?grant_type=password", { email, password });
  const session = normalizeSession(data);
  if (!session) throw new Error("Supabase не вернул сессию. Проверьте email/password и настройки Auth.");
  storeSession(session);
  return session;
}

export async function signUpAuction(email: string, password: string) {
  const data = await authRequest("signup", { email, password });
  const session = normalizeSession(data);
  if (session) storeSession(session);
  return { session, user: data?.user || null };
}

export function signOutAuction() {
  storeSession(null);
}

export async function getAuctionSession(): Promise<AuctionSession | null> {
  const current = readStoredSession();
  if (!current) return null;
  const now = Math.floor(Date.now() / 1000);
  if ((current.expires_at || 0) > now + 90) return current;
  try {
    const data = await authRequest("token?grant_type=refresh_token", { refresh_token: current.refresh_token });
    const refreshed = normalizeSession(data);
    if (!refreshed) throw new Error("Не удалось обновить сессию");
    storeSession(refreshed);
    return refreshed;
  } catch {
    storeSession(null);
    return null;
  }
}

async function restRequest<T>(path: string, session: AuctionSession, init: RequestInit = {}): Promise<T> {
  const { url, anonKey } = config();
  const headers: Record<string, string> = {
    apikey: anonKey,
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${url}/rest/v1/${path}`, { ...init, headers });
  return (await parseResponse(res)) as T;
}

export async function loadAuctionData(session: AuctionSession) {
  const [segments, companies] = await Promise.all([
    restRequest<AuctionSegment[]>("software_auction_segments?select=*&order=priority.asc", session),
    restRequest<AuctionCompany[]>("software_auction_companies?select=*&order=tier.asc,created_at.asc", session),
  ]);
  return { segments, companies };
}

export async function bootstrapAuction(session: AuctionSession) {
  let segments = await restRequest<AuctionSegment[]>(
    "software_auction_segments?select=*&order=priority.asc",
    session
  );

  const existingCodes = new Set(segments.map((segment) => segment.code));
  const missingSegments = SEGMENT_TEMPLATES.filter((segment) => !existingCodes.has(segment.code));

  if (missingSegments.length) {
    const inserted = await restRequest<AuctionSegment[]>("software_auction_segments?select=*", session, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(missingSegments.map((segment) => ({ ...segment, user_id: session.user.id }))),
    });
    segments = [...segments, ...inserted].sort((a, b) => a.priority - b.priority);
  }

  const byCode = new Map(segments.map((segment) => [segment.code, segment.id]));
  const existingCompanies = await restRequest<Array<Pick<AuctionCompany, "segment_id" | "name">>>(
    "software_auction_companies?select=segment_id,name",
    session
  );
  const existingCompanyKeys = new Set(
    existingCompanies.map((company) => `${company.segment_id}::${company.name.trim().toLowerCase()}`)
  );

  const missingCompanies = COMPANY_TEMPLATES.flatMap((company) => {
    const segmentId = byCode.get(company.segment_code);
    if (!segmentId) return [];
    const key = `${segmentId}::${company.name.trim().toLowerCase()}`;
    if (existingCompanyKeys.has(key)) return [];
    return [
      {
        user_id: session.user.id,
        segment_id: segmentId,
        name: company.name,
        tier: company.tier,
        stage: "research",
        current_software: company.current_software,
        evidence_url: company.evidence_url,
        evidence_note: company.evidence_note,
        evidence_confidence: company.evidence_confidence,
        decision_maker_role: company.decision_maker_role,
        why_now: company.why_now,
        estimated_tco_kzt: company.estimated_tco_kzt || null,
        next_action: "Перепроверить стек, найти ЛПР и дату продления",
      },
    ];
  });

  if (missingCompanies.length) {
    await restRequest("software_auction_companies", session, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(missingCompanies),
    });
  }

  return loadAuctionData(session);
}

export async function updateAuctionCompany(
  session: AuctionSession,
  id: string,
  patch: Partial<AuctionCompany>
) {
  const clean = { ...patch } as Record<string, unknown>;
  delete clean.id;
  delete clean.user_id;
  delete clean.created_at;
  delete clean.updated_at;
  return restRequest<AuctionCompany[]>(`software_auction_companies?id=eq.${encodeURIComponent(id)}&select=*`, session, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(clean),
  });
}

export async function createAuctionCompany(
  session: AuctionSession,
  company: Partial<AuctionCompany> & { name: string; segment_id: string }
) {
  return restRequest<AuctionCompany[]>("software_auction_companies?select=*", session, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: session.user.id,
      tier: "B",
      stage: "research",
      current_software: "",
      evidence_url: "",
      evidence_note: "",
      evidence_confidence: "low",
      decision_maker_role: "",
      why_now: "",
      next_action: "Проверить используемый софт и найти ЛПР",
      ...company,
    }),
  });
}

export async function addAuctionActivity(
  session: AuctionSession,
  companyId: string,
  note: string,
  activityType = "note"
) {
  return restRequest<AuctionActivity[]>("software_auction_activities?select=*", session, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: session.user.id,
      company_id: companyId,
      activity_type: activityType,
      note,
    }),
  });
}

export async function loadAuctionActivities(session: AuctionSession, companyId: string) {
  return restRequest<AuctionActivity[]>(
    `software_auction_activities?company_id=eq.${encodeURIComponent(companyId)}&select=*&order=created_at.desc&limit=50`,
    session
  );
}
