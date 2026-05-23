import type { RequestHandler } from "@builder.io/qwik-city";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { checkRateLimit, PLAN_RATE_LIMITS } from "~/lib/rate-limiter";
import { recordUsage } from "~/lib/usage";
// ALETHEIADB_URL and admin key are dynamically resolved per-request to support serverless/edge environments

export const onRequest: RequestHandler = async (event) => {
  const { request, env, url, params } = event;

  // 1. Extract API Key from incoming request
  let apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      apiKey = authHeader.substring(7).trim();
    }
  }

  if (!apiKey) {
    throw event.error(401, "Unauthorized - Missing API Key");
  }

  // 2. Validate API Key against Supabase
  const supabase = getAdminSupabaseClient(env);
  if (!supabase) {
    throw event.error(500, "Internal Server Error - Database connection is offline");
  }
  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id, is_active, cluster_id")
    .eq("key_value", apiKey)
    .maybeSingle();

  if (error || !data || !data.is_active) {
    throw event.error(401, "Unauthorized - Invalid or revoked API Key");
  }

  const userId = data.user_id;
  const clusterId = data.cluster_id;

  // 3. Rate limiting — check tier limits
  if (clusterId) {
    const { data: cluster } = await supabase
      .from("clusters")
      .select("tier")
      .eq("id", clusterId)
      .maybeSingle();

    const tier = (cluster as any)?.tier || "free";
    const rateResult = await checkRateLimit(env, clusterId, tier);

    if (!rateResult.allowed) {
      throw event.json(429, {
        error: "Rate limit exceeded",
        retry_after: rateResult.retryAfter,
        daily_remaining: rateResult.dailyRemaining,
      });
    }
  }

  // 4. Clone and parse the request body to enforce namespace isolation
  let bodyBuffer = await request.arrayBuffer();
  let bodyStr = new TextDecoder().decode(bodyBuffer);
  let isIngest = false;
  let isQuery = false;

  if (['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase()) && bodyStr.trim().startsWith('{')) {
    try {
      const payload = JSON.parse(bodyStr);

      if (payload.entity_id) {
        payload.entity_id = `${userId}::${payload.entity_id}`;
      } else {
        payload.entity_id = userId;
      }

      // Track what kind of operation this is for usage recording
      const catchallPath = params.catchall || "";
      isIngest = catchallPath.includes("ingest");
      isQuery = catchallPath.includes("query");

      bodyStr = JSON.stringify(payload);
    } catch {}
  }

  // 5. Proxy the request to the Rust engine
  const aletheiaUrl = (env.get("ALETHEIADB_URL") || process.env.ALETHEIADB_URL || "http://localhost:3000").replace(/\/+$/, "");
  const aletheiaAdminKey = env.get("ALETHEIADB_ADMIN_KEY") || env.get("ALETHEIADB_API_KEY") || process.env.ALETHEIADB_ADMIN_KEY || "82a2cd542b86763b5941fba04db9802928c53a27256fcccb64e12f414f69826a";

  const proxyUrl = `${aletheiaUrl}/${params.catchall}${url.search}`;
  const headers = new Headers();
  headers.set("Content-Type", request.headers.get("content-type") || "application/json");
  headers.set("x-api-key", aletheiaAdminKey);

  try {
    const proxyResponse = await fetch(proxyUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method.toUpperCase()) ? undefined : bodyStr,
    });

    const responseBody = await proxyResponse.arrayBuffer();
    const newResponseHeaders = new Headers(proxyResponse.headers);
    newResponseHeaders.delete("content-encoding");
    newResponseHeaders.delete("transfer-encoding");

    // 6. Record usage
    if (clusterId && proxyResponse.ok) {
      try {
        await recordUsage(env, clusterId, {
          requests: 1,
          queries: isQuery ? 1 : 0,
          ingests: isIngest ? 1 : 0,
        });
      } catch {}
    }

    event.send(new Response(responseBody, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: newResponseHeaders,
    }));
  } catch {
    throw event.error(502, "Bad Gateway - Rust Engine is offline");
  }
};
