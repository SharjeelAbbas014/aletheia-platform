import { DEFAULT_TEST_API_KEY } from "~/lib/api-keys";

export interface HeroMemoryHit {
  memory_id: string;
  session_id: string;
  created_at_ms: number;
  similarity: number;
  textual_content: string;
}

export interface HeroMemoryHitView extends HeroMemoryHit {
  createdLabel: string;
}

export interface HeroWarmupResult {
  ok: boolean;
  message?: string;
  status?: string;
  roundTripLabel?: string;
  engineLabel?: string;
}

export interface HeroDemoResult {
  ok: boolean;
  message?: string;
  entityId?: string;
  memoryId?: string;
  submittedText?: string;
  ingestLabel?: string;
  ingestRoundTripLabel?: string;
  queryLabel?: string;
  queryRoundTripLabel?: string;
  queryUnderBlink?: boolean;
  hits?: HeroMemoryHitView[];
}

export type HeroCookieEvent = {
  cookie: {
    get: (name: string) => { value?: string } | null | undefined;
    set: (
      name: string,
      value: string,
      options: ReturnType<typeof heroDemoCookieOptions>
    ) => void;
  };
};

export type HeroEnvEvent = {
  env?: {
    get: (key: string) => string | null | undefined;
  };
};

export const HERO_DEMO_ENTITY_COOKIE = "aletheia_hero_demo_entity";

export function heroDemoCookieOptions() {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30
  };
}

export function ensureHeroDemoEntity(event: HeroCookieEvent) {
  const existing = event.cookie.get(HERO_DEMO_ENTITY_COOKIE)?.value?.trim();
  if (existing) {
    return existing;
  }

  const next = `hero-demo-${crypto.randomUUID()}`;
  event.cookie.set(HERO_DEMO_ENTITY_COOKIE, next, heroDemoCookieOptions());
  return next;
}

export function readEnvValue(event: HeroEnvEvent | undefined, key: string): string | undefined {
  const fromEvent = event?.env?.get(key)?.trim();
  if (fromEvent) {
    return fromEvent;
  }

  const fromProcess = process.env[key]?.trim();
  if (fromProcess) {
    return fromProcess;
  }

  return undefined;
}

export function heroEngineBaseUrl(event?: HeroEnvEvent) {
  return (
    readEnvValue(event, "ALETHEIA_HERO_ENGINE_URL") ??
    readEnvValue(event, "ALETHEIA_URL") ??
    "https://4tcjq5z2yap9nd.api.runpod.ai"
  ).replace(/\/+$/, "");
}

export function heroEngineApiKey(event?: HeroEnvEvent) {
  return (
    readEnvValue(event, "ALETHEIA_HERO_API_KEY") ??
    readEnvValue(event, "ALETHEIA_API_KEY") ??
    DEFAULT_TEST_API_KEY
  ).trim();
}

export function heroRunpodToken(event?: HeroEnvEvent) {
  return (
    readEnvValue(event, "ALETHEIA_HERO_RUNPOD_TOKEN") ??
    readEnvValue(event, "ALETHEIA_RUNPOD_TOKEN") ??
    readEnvValue(event, "RUNPOD_API_KEY") ??
    ""
  ).trim();
}

export function heroRequestHeaders(event?: HeroEnvEvent, includeJson = false) {
  const headers = new Headers();
  if (includeJson) {
    headers.set("content-type", "application/json");
  }
  headers.set("x-api-key", heroEngineApiKey(event));
  const runpodToken = heroRunpodToken(event);
  if (runpodToken) {
    headers.set("Authorization", `Bearer ${runpodToken}`);
  }
  return headers;
}

export function readEngineTotalUs(headers: Headers) {
  const headerUs = headers.get("x-tm-total-us");
  if (headerUs) {
    const parsed = Number(headerUs);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const headerMs = headers.get("x-tm-total-ms");
  if (headerMs) {
    const parsed = Number(headerMs);
    if (Number.isFinite(parsed)) {
      return parsed * 1000;
    }
  }

  return null;
}

export function formatEngineMs(totalUs: number | null) {
  if (totalUs == null) {
    return "n/a";
  }
  const totalMs = totalUs / 1000;
  return totalMs >= 10 ? `${Math.round(totalMs)} ms` : `${totalMs.toFixed(1)} ms`;
}

export function formatHeroTimestamp(value: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatRoundTripMs(startedAt: number) {
  const totalMs = Date.now() - startedAt;
  return totalMs >= 10 ? `${Math.round(totalMs)} ms` : `${totalMs.toFixed(1)} ms`;
}
