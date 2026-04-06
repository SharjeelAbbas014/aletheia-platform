const ALETHEIA_URL = (process.env.ALETHEIA_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const DEFAULT_TEST_API_KEY = "XXX1111AAA";

export interface ApiKey {
  key_id: string;
  name: string;
  key_prefix: string;
  created_at_ms: number;
  last_used_ms: number | null;
  disabled: boolean;
  token?: string; // Only returned on creation
}

export interface UsageStats {
    request_count: number;
    ingest_count: number;
    query_count: number;
    temporal_query_count: number;
    last_request_ms: number | null;
}

export async function getApiKeys(sessionToken: string): Promise<ApiKey[]> {
  try {
    const response = await fetch(`${ALETHEIA_URL}/platform/api-keys`, {
      headers: {
        "Authorization": `Bearer ${sessionToken}`
      }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.api_keys || [];
  } catch (e) {
    return [];
  }
}

export async function createApiKey(sessionToken: string, name: string): Promise<ApiKey | null> {
  try {
    const response = await fetch(`${ALETHEIA_URL}/platform/api-keys`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sessionToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    return null;
  }
}

export async function revokeApiKey(sessionToken: string, keyId: string): Promise<boolean> {
  try {
    const response = await fetch(`${ALETHEIA_URL}/platform/api-keys/${keyId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${sessionToken}`
      }
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

export async function getUsageStats(sessionToken: string): Promise<UsageStats | null> {
    try {
      const response = await fetch(`${ALETHEIA_URL}/platform/stats`, {
        headers: {
          "Authorization": `Bearer ${sessionToken}`
        }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.usage;
    } catch (e) {
      return null;
    }
}
