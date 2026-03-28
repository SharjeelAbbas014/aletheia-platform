import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

const API_KEYS_COOKIE = "aletheia_api_keys";
export const DEFAULT_TEST_API_KEY = "XXX1111AAA";
export const DEFAULT_TEST_API_KEY_ID = "aletheia-default-test-key";

export type ApiKeyRecord = {
  id: string;
  name: string;
  token: string;
  preview: string;
  createdAt: string;
  lastUsed: string;
  scope: string;
};

const cookieBase = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 30
};

function defaultApiKeyRecord(): ApiKeyRecord {
  return {
    id: DEFAULT_TEST_API_KEY_ID,
    name: "Shared testing key",
    token: DEFAULT_TEST_API_KEY,
    preview: previewToken(DEFAULT_TEST_API_KEY),
    createdAt: "2026-03-28T00:00:00.000Z",
    lastUsed: "Ready for smoke tests",
    scope: "read:memories write:memories"
  };
}

function makeToken() {
  return `tm_live_${randomUUID().replace(/-/g, "")}${randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)}`;
}

function previewToken(token: string) {
  return `${token.slice(0, 14)}...${token.slice(-6)}`;
}

function parseKeys(raw: string | undefined): ApiKeyRecord[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ApiKeyRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function withoutDefaultKey(keys: ApiKeyRecord[]): ApiKeyRecord[] {
  return keys.filter(
    (key) => key.id !== DEFAULT_TEST_API_KEY_ID && key.token !== DEFAULT_TEST_API_KEY
  );
}

function withDefaultKey(keys: ApiKeyRecord[]): ApiKeyRecord[] {
  return [defaultApiKeyRecord(), ...withoutDefaultKey(keys)].slice(0, 6);
}

async function persistKeys(keys: ApiKeyRecord[]) {
  const store = await cookies();
  store.set(API_KEYS_COOKIE, JSON.stringify(withoutDefaultKey(keys)), cookieBase);
}

export async function getApiKeys() {
  const store = await cookies();
  return withDefaultKey(parseKeys(store.get(API_KEYS_COOKIE)?.value));
}

export async function createApiKey(name: string) {
  const label = name.trim() || "Default production key";
  const token = makeToken();
  const keys = withoutDefaultKey(await getApiKeys());

  const nextKeys = withDefaultKey([
    {
      id: randomUUID(),
      name: label,
      token,
      preview: previewToken(token),
      createdAt: new Date().toISOString(),
      lastUsed: "Never",
      scope: "read:memories write:memories"
    },
    ...keys
  ]);

  await persistKeys(nextKeys);
}

export async function revokeApiKey(id: string) {
  const keys = withoutDefaultKey(await getApiKeys());
  await persistKeys(keys.filter((key) => key.id !== id));
}
