import type { RequestHandler } from "@builder.io/qwik-city";

const POSTHOG_HOST = "https://us.i.posthog.com";

export const onRequest: RequestHandler = async ({ request, params, url, send }) => {
  const restPath = params.rest || "";
  const targetUrl = `${POSTHOG_HOST}/${restPath}${url.search}`;
  const body = request.method !== "GET" && request.method !== "HEAD" ? await request.text() : null;
  const contentType = request.headers.get("Content-Type") || "application/json";

  const res = await fetch(targetUrl, {
    method: request.method,
    headers: body
      ? { "Content-Type": contentType, "User-Agent": "aletheia-posthog-proxy" }
      : { "User-Agent": "aletheia-posthog-proxy" },
    body,
  });

  const resBody = await res.text();
  send(new Response(resBody, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "text/plain" }
  }));
};
