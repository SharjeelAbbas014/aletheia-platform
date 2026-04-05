import type { RequestHandler } from "@builder.io/qwik-city";

import { setPrivateNoStore } from "~/lib/cache";
import {
  ensureHeroDemoEntity,
  formatEngineMs,
  formatHeroTimestamp,
  formatRoundTripMs,
  heroEngineBaseUrl,
  heroRequestHeaders,
  readEngineTotalUs,
  type HeroDemoResult,
  type HeroMemoryHit
} from "~/lib/hero-demo";

export const onPost: RequestHandler = async (event) => {
  setPrivateNoStore(event);

  const body = (await event.parseBody()) as Record<string, unknown>;
  const message = String(body.message ?? "").trim();

  if (!message) {
    const response: HeroDemoResult = {
      ok: false,
      message: "Enter a user message so the engine has something real to save."
    };
    event.json(400, response);
    return;
  }

  const entityId = ensureHeroDemoEntity(event);
  const now = Date.now();
  const memoryId = `${entityId}::hero-demo::${now}`;
  let ingestResponse: Response;
  let queryResponse: Response;
  const ingestStartedAt = Date.now();

  try {
    ingestResponse = await fetch(`${heroEngineBaseUrl(event)}/ingest`, {
      method: "POST",
      headers: heroRequestHeaders(event, true),
      body: JSON.stringify({
        entity_id: entityId,
        memory_id: memoryId,
        timestamp: now,
        textual_content: message,
        relations: []
      }),
      signal: AbortSignal.timeout(60_000)
    });
  } catch (error) {
    const response: HeroDemoResult = {
      ok: false,
      message:
        error instanceof Error
          ? `Ingest transport failed. ${error.message}`
          : "Ingest transport failed."
    };
    event.json(502, response);
    return;
  }

  if (!ingestResponse.ok) {
    const response: HeroDemoResult = {
      ok: false,
      message: `Ingest failed (${ingestResponse.status}). ${await ingestResponse.text()}`
    };
    event.json(502, response);
    return;
  }

  const queryStartedAt = Date.now();

  try {
    queryResponse = await fetch(`${heroEngineBaseUrl(event)}/query/semantic`, {
      method: "POST",
      headers: heroRequestHeaders(event, true),
      body: JSON.stringify({
        entity_id: entityId,
        textual_query: message,
        limit: 4
      }),
      signal: AbortSignal.timeout(60_000)
    });
  } catch (error) {
    const response: HeroDemoResult = {
      ok: false,
      message:
        error instanceof Error
          ? `Query transport failed. ${error.message}`
          : "Query transport failed."
    };
    event.json(502, response);
    return;
  }

  if (!queryResponse.ok) {
    const response: HeroDemoResult = {
      ok: false,
      message: `Query failed (${queryResponse.status}). ${await queryResponse.text()}`
    };
    event.json(502, response);
    return;
  }

  const hits = (await queryResponse.json()) as HeroMemoryHit[];
  const ingestUs = readEngineTotalUs(ingestResponse.headers);
  const queryUs = readEngineTotalUs(queryResponse.headers);

  const response: HeroDemoResult = {
    ok: true,
    entityId,
    memoryId,
    submittedText: message,
    ingestLabel: formatEngineMs(ingestUs),
    ingestRoundTripLabel: formatRoundTripMs(ingestStartedAt),
    queryLabel: formatEngineMs(queryUs),
    queryRoundTripLabel: formatRoundTripMs(queryStartedAt),
    queryUnderBlink: queryUs != null && queryUs / 1000 < 100,
    hits: hits.slice(0, 4).map((hit) => ({
      ...hit,
      createdLabel: formatHeroTimestamp(hit.created_at_ms)
    }))
  };

  event.json(200, response);
};
