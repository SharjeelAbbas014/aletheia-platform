import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

const API_KEYS_COOKIE = "aletheia_api_keys";

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

async function persistKeys(keys: ApiKeyRecord[]) {
  const store = await cookies();
  store.set(API_KEYS_COOKIE, JSON.stringify(keys), cookieBase);
}

export async function getApiKeys() {
  const store = await cookies();
  return parseKeys(store.get(API_KEYS_COOKIE)?.value);
}

export async function createApiKey(name: string) {
  const label = name.trim() || "Default production key";
  const token = makeToken();
  const keys = await getApiKeys();

  const nextKeys: ApiKeyRecord[] = [
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
  ].slice(0, 6);

  await persistKeys(nextKeys);
}

export async function revokeApiKey(id: string) {
  const keys = await getApiKeys();
  await persistKeys(keys.filter((key) => key.id !== id));
}

