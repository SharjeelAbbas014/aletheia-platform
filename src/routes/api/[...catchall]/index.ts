import type { RequestHandler } from "@builder.io/qwik-city";
import { getAdminSupabaseClient } from "~/lib/supabase";

const ALETHEIA_URL = (process.env.ALETHEIA_URL || "http://localhost:3000").replace(/\/+$/, "");

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

  // 2. Validate API Key against Supabase PostgreSQL
  const supabase = getAdminSupabaseClient(env);
  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id, is_active")
    .eq("key_value", apiKey)
    .single();

  if (error || !data || !data.is_active) {
    throw event.error(401, "Unauthorized - Invalid or revoked API Key");
  }

  const userId = data.user_id;

  // 3. Clone and parse the request body to enforce the namespace securely.
  let bodyBuffer = await request.arrayBuffer();
  let bodyStr = new TextDecoder().decode(bodyBuffer);
  
  if (['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase()) && bodyStr.trim().startsWith('{')) {
      try {
          const payload = JSON.parse(bodyStr);
          
          // Enforce multi-tenant data partitioning by permanently tying the entity_id to the user_id.
          if (payload.entity_id) {
              payload.entity_id = `${userId}::${payload.entity_id}`;
          } else {
              payload.entity_id = userId;
          }
          
          bodyStr = JSON.stringify(payload);
      } catch (e) {
          // If we fail to parse as JSON, we route it as-is. The rust engine will reject invalid JSON anyway.
      }
  }

  // 4. Construct the proxy request sending it to the true Backend
  const proxyUrl = `${ALETHEIA_URL}/${params.catchall}${url.search}`;
  
  const headers = new Headers();
  headers.set("Content-Type", request.headers.get("content-type") || "application/json");
  // Set the Global Trust Key so the Rust engine universally authenticates the Qwik frontend connection!
  headers.set("x-api-key", "XXX1111AAA"); 

  try {
    const proxyResponse = await fetch(proxyUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method.toUpperCase()) ? undefined : bodyStr
    });

    const responseBody = await proxyResponse.arrayBuffer();
    
    const newResponseHeaders = new Headers(proxyResponse.headers);
    newResponseHeaders.delete("content-encoding");
    newResponseHeaders.delete("transfer-encoding");
    
    event.send(new Response(responseBody, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: newResponseHeaders
    }));
  } catch (e) {
    throw event.error(502, "Bad Gateway - Rust Engine is offline");
  }
};
