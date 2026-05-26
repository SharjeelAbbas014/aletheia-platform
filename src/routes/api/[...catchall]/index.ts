import type { RequestHandler } from "@builder.io/qwik-city";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { checkRateLimit } from "~/lib/rate-limiter";
import { recordUsage } from "~/lib/usage";

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

  // 2. Validate API Key against Supabase and get associated cluster details
  const supabase = getAdminSupabaseClient(env);
  if (!supabase) {
    throw event.error(500, "Internal Server Error - Database connection is offline");
  }
  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id, is_active, cluster_id, clusters(tier, endpoint_url)")
    .eq("key_value", apiKey)
    .maybeSingle();

  if (error || !data || !data.is_active) {
    throw event.error(401, "Unauthorized - Invalid or revoked API Key");
  }

  const userId = data.user_id;
  const clusterId = data.cluster_id;
  const clusterData = data.clusters 
    ? (Array.isArray(data.clusters) ? data.clusters[0] : data.clusters) 
    : null;

  const isFractional = !clusterData || clusterData.tier === "fractional";
  const customEndpointUrl = (clusterData as any)?.endpoint_url || "";
  const customEngineKey = (clusterData as any)?.engine_key || "";
  const clusterTier = (clusterData as any)?.tier || "fractional";

  // 3. Billing check - only for fractional (shared) tier
  if (isFractional) {
    let { data: sub } = await supabase
      .from("subscriptions")
      .select("token_balance, free_tokens_granted_at")
      .eq("user_id", userId)
      .maybeSingle();

    let tokenBalance = sub?.token_balance ?? 10000;
    let lastGranted = sub?.free_tokens_granted_at ? new Date(sub.free_tokens_granted_at).getTime() : 0;
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

    if (Date.now() - lastGranted > oneMonthMs) {
      tokenBalance = 10000;
      lastGranted = Date.now();
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        token_balance: tokenBalance,
        free_tokens_granted_at: new Date(lastGranted).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    if (tokenBalance <= 0) {
      throw event.json(402, {
        error: "Payment Required - Prepaid token balance exhausted. Please visit https://aletheiadb.com/platform/billing to purchase credits.",
      });
    }
  }

  // 4. Rate limiting — check tier limits (skip for self_hosted VM)
  if (clusterId && clusterTier !== "self_hosted") {
    const rateResult = await checkRateLimit(env, clusterId, clusterTier);

    if (!rateResult.allowed) {
      throw event.json(429, {
        error: "Rate limit exceeded",
        retry_after: rateResult.retryAfter,
        daily_remaining: rateResult.dailyRemaining,
      });
    }
  }

  // 5. Clone and parse the request body to enforce namespace isolation (only for fractional)
  let bodyBuffer = await request.arrayBuffer();
  let bodyStr = new TextDecoder().decode(bodyBuffer);
  let isIngest = false;
  let isQuery = false;

  if (['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase()) && bodyStr.trim().startsWith('{')) {
    try {
      const payload = JSON.parse(bodyStr);

      if (isFractional) {
        if (payload.entity_id) {
          payload.entity_id = `${userId}::${payload.entity_id}`;
        } else {
          payload.entity_id = userId;
        }
      }

      // Track what kind of operation this is for usage recording
      const catchallPath = params.catchall || "";
      isIngest = catchallPath.includes("ingest");
      isQuery = catchallPath.includes("query");

      bodyStr = JSON.stringify(payload);
    } catch {}
  }

  // 6. Proxy the request to the correct Rust engine
  const targetUrl = isFractional
    ? (env.get("ALETHEIADB_URL") || process.env.ALETHEIADB_URL || "http://localhost:3000").replace(/\/+$/, "")
    : customEndpointUrl;

  const targetKey = isFractional
    ? (env.get("ALETHEIADB_ADMIN_KEY") || env.get("ALETHEIADB_API_KEY") || process.env.ALETHEIADB_ADMIN_KEY || "82a2cd542b86763b5941fba04db9802928c53a27256fcccb64e12f414f69826a")
    : customEngineKey;

  const proxyUrl = `${targetUrl}/${params.catchall}${url.search}`;
  const headers = new Headers();
  headers.set("Content-Type", request.headers.get("content-type") || "application/json");
  headers.set("x-api-key", targetKey);

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

    // 7. Record usage and decrement token balance
    if (clusterId && proxyResponse.ok) {
      try {
        await recordUsage(env, clusterId, {
          requests: 1,
          queries: isQuery ? 1 : 0,
          ingests: isIngest ? 1 : 0,
        });
        
        if (isFractional) {
          // Deduct 1 credit per truth/operation
          await supabase.rpc("decrement_token_balance", {
            uid: userId,
            amount: 1,
          });
        }
      } catch {}
    }

    event.send(new Response(responseBody, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: newResponseHeaders,
    }));
  } catch (err) {
    console.error("Proxy Error:", err);
    throw event.error(502, "Bad Gateway - Rust Engine is offline");
  }
};
