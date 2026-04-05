import type { RequestHandler } from "@builder.io/qwik-city";

import { setPrivateNoStore } from "~/lib/cache";
import {
  buildHeroMemoryId,
  formatEngineMs,
  formatHeroTimestamp,
  formatRoundTripMs,
  heroEngineBaseUrl,
  heroRequestHeaders,
  readEngineTotalUs,
  resolveHeroEntityId,
  type HeroDemoResult,
  type HeroMemoryHit
} from "~/lib/hero-demo";

export const onPost: RequestHandler = async (event) => {
  setPrivateNoStore(event);
  event.headers.set("Content-Type", "application/json; charset=utf-8");

  const body = (await event.parseBody()) as Record<string, unknown>;
  const action = String(body.action ?? "store").trim().toLowerCase();
  const message = String(body.message ?? "").trim();

  if (action !== "store" && action !== "recall") {
    const response: HeroDemoResult = {
      ok: false,
      message: "Invalid hero demo action.",
      action: "store"
    };
    event.send(400, JSON.stringify(response));
    return;
  }

  if (!message) {
    const response: HeroDemoResult = {
      ok: false,
      message:
        action === "store"
          ? "Enter a user message so the engine has something real to save."
          : "Enter a query to recall memories for this demo user.",
      action
    };
    event.send(400, JSON.stringify(response));
    return;
  }

  const entityId = resolveHeroEntityId(event);
  const now = Date.now();
  const memoryId = buildHeroMemoryId(entityId, now);
  let ingestResponse: Response;
  let queryResponse: Response;
  const response: HeroDemoResult = {
    ok: true,
    action,
    entityId,
    submittedText: message
  };

  if (action === "store") {
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
      const failed: HeroDemoResult = {
        ok: false,
        action,
        entityId,
        message:
          error instanceof Error
            ? `Ingest transport failed. ${error.message}`
            : "Ingest transport failed."
      };
      event.send(502, JSON.stringify(failed));
      return;
    }

    if (!ingestResponse.ok) {
      const failed: HeroDemoResult = {
        ok: false,
        action,
        entityId,
        message: `Ingest failed (${ingestResponse.status}). ${await ingestResponse.text()}`
      };
      event.send(502, JSON.stringify(failed));
      return;
    }

    const ingestUs = readEngineTotalUs(ingestResponse.headers);
    response.memoryId = memoryId;
    response.ingestLabel = formatEngineMs(ingestUs);
    response.ingestRoundTripLabel = formatRoundTripMs(ingestStartedAt);
    event.send(200, JSON.stringify(response));
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
    const failed: HeroDemoResult = {
      ok: false,
      action,
      entityId,
      message:
        error instanceof Error
          ? `Query transport failed. ${error.message}`
          : "Query transport failed."
    };
    event.send(502, JSON.stringify(failed));
    return;
  }

  if (!queryResponse.ok) {
    const failed: HeroDemoResult = {
      ok: false,
      action,
      entityId,
      message: `Query failed (${queryResponse.status}). ${await queryResponse.text()}`
    };
    event.send(502, JSON.stringify(failed));
    return;
  }

  const hits = (await queryResponse.json()) as HeroMemoryHit[];
  const queryUs = readEngineTotalUs(queryResponse.headers);
  response.queryLabel = formatEngineMs(queryUs);
  response.queryRoundTripLabel = formatRoundTripMs(queryStartedAt);
  response.queryUnderBlink = queryUs != null && queryUs / 1000 < 100;
  response.hits = hits.slice(0, 4).map((hit) => ({
    ...hit,
    createdLabel: formatHeroTimestamp(hit.created_at_ms)
  }));

  event.send(200, JSON.stringify(response));
};
