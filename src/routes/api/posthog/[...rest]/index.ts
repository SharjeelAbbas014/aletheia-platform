import type { RequestHandler } from "@builder.io/qwik-city";

const POSTHOG_HOST = "https://us.i.posthog.com";

export const onRequest: RequestHandler = async ({ request, params, send }) => {
  const restPath = params.rest || "";
  const url = `${POSTHOG_HOST}/${restPath}`;
  const body = request.method !== "GET" && request.method !== "HEAD" ? await request.text() : null;

  const headers: Record<string, string> = {};
  request.headers.forEach((val, key) => {
    if (key.toLowerCase() !== "host") headers[key] = val;
  });

  const res = await fetch(url, {
    method: request.method,
    headers: body ? { ...headers, "Content-Type": request.headers.get("Content-Type") || "application/json" } : headers,
    body,
  });

  const resBody = await res.text();
  send(new Response(resBody, { status: res.status, headers: { "Content-Type": res.headers.get("Content-Type") || "text/plain" } }));
};
