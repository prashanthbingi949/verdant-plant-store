type SupabaseConfig = {
  url: string;
  key: string;
};

function getConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function isSupabaseConfigured() {
  return Boolean(getConfig());
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

  return fetch(`${config.url}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
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
