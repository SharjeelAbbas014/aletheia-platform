import type { RequestEventCommon } from "@builder.io/qwik-city";

type CookieStore = RequestEventCommon["cookie"];

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

function previewToken(token: string) {
  return `${token.slice(0, 14)}...${token.slice(-6)}`;
}

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

function parseKeys(raw: string | undefined): ApiKeyRecord[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ApiKeyRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function withoutDefaultKey(keys: ApiKeyRecord[]) {
  return keys.filter(
    (key) =>
      key.id !== DEFAULT_TEST_API_KEY_ID && key.token !== DEFAULT_TEST_API_KEY
  );
}

function withDefaultKey(keys: ApiKeyRecord[]) {
  return [defaultApiKeyRecord(), ...withoutDefaultKey(keys)].slice(0, 6);
}

function persistKeys(cookie: CookieStore, keys: ApiKeyRecord[]) {
  cookie.set(
    API_KEYS_COOKIE,
    JSON.stringify(withoutDefaultKey(keys)),
    cookieBase
  );
}

function makeToken() {
  return `tm_live_${crypto.randomUUID().replace(/-/g, "")}${crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)}`;
}

export function getApiKeys(cookie: CookieStore) {
  return withDefaultKey(parseKeys(cookie.get(API_KEYS_COOKIE)?.value));
}

export function createApiKey(cookie: CookieStore, name: string) {
  const label = name.trim() || "Default production key";
  const token = makeToken();
  const keys = withoutDefaultKey(getApiKeys(cookie));

  const nextKeys = withDefaultKey([
    {
      id: crypto.randomUUID(),
      name: label,
      token,
      preview: previewToken(token),
      createdAt: new Date().toISOString(),
      lastUsed: "Never",
      scope: "read:memories write:memories"
    },
    ...keys
  ]);

  persistKeys(cookie, nextKeys);
}

export function revokeApiKey(cookie: CookieStore, id: string) {
  const keys = withoutDefaultKey(getApiKeys(cookie));
  persistKeys(
    cookie,
    keys.filter((key) => key.id !== id)
  );
}
