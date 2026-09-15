type SupabaseConfig = {
  url: string;
  key: string;
};

function getConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function isSupabaseConfigured() {
  return Boolean(getConfig());
}

export function getSupabaseServerConfigStatus() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  let keyType = "missing";
  if (key.startsWith("sb_secret_")) keyType = "supabase_secret";
  else if (key.startsWith("sb_service_role_")) keyType = "supabase_service_role";
  else if (key.startsWith("eyJ")) keyType = "jwt_service_role_or_legacy";
  else if (key) keyType = "unknown";

  return {
    configured: Boolean(url && key),
    urlHost: (() => {
      try { return new URL(url).host; } catch { return "invalid_url"; }
    })(),
    keyType,
    keyLength: key.length,
  };
}

export async function supabaseRest(
  path: string,
  init: RequestInit = {},
): Promise<Response | null> {
  const config = getConfig();
  if (!config) return null;

  const headers = new Headers(init.headers);
  headers.set("apikey", config.key);
  headers.set("Authorization", `Bearer ${config.key}`);
  headers.set("Content-Type", "application/json");

  try {
    return await fetch(`${config.url}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    // Keep API routes from crashing when Supabase is unreachable.
    return null;
  }
}

export async function supabaseInsert(table: string, row: Record<string, unknown>) {
  const response = await supabaseRest(`/rest/v1/${table}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  });

  if (!response) return { configured: false, response: null, data: null };
  const data = await response.json().catch(() => null);
  return { configured: true, response, data };
}

export async function supabaseUpdate(
  table: string,
  filter: string,
  row: Record<string, unknown>,
) {
  const response = await supabaseRest(`/rest/v1/${table}?${filter}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  });

  if (!response) return { configured: false, response: null, data: null };
  const data = await response.json().catch(() => null);
  return { configured: true, response, data };
}

export async function supabaseSelect(
  table: string,
  query = "select=*",
) {
  const response = await supabaseRest(`/rest/v1/${table}?${query}`, {
    method: "GET",
  });

  if (!response) return { configured: false, response: null, data: null };
  const data = await response.json().catch(() => null);
  return { configured: true, response, data };
}
