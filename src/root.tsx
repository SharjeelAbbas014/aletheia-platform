import { component$, useVisibleTask$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet
} from "@builder.io/qwik-city";
import { inject } from "@vercel/analytics";
import { FlowbiteProvider, FlowbiteProviderHeader } from "flowbite-qwik";

import { RouterHead } from "./components/router-head/router-head";
import { commonHeadLinks, commonHeadScripts } from "./constants/theme";
import { initPostHog } from "./lib/posthog";
import "./global.css";

const SENTRY_DSN = import.meta.env.PUBLIC_SENTRY_DSN || "";

function sendToSentry(error: Error | string, extra?: Record<string, unknown>) {
  console.log("[Sentry Debug] sendToSentry called", { error, dsn: SENTRY_DSN ? "SET" : "EMPTY" });
  if (!SENTRY_DSN) {
    console.warn("[Sentry Debug] DSN is empty, skipping");
    return;
  }
  const err = error instanceof Error ? error : new Error(String(error));
  const projectId = SENTRY_DSN.split("/").pop() || "";
  const host = new URL(SENTRY_DSN).host;
  const payload = {
    event_id: crypto.randomUUID().replace(/-/g, "").slice(0, 32),
    timestamp: Date.now() / 1000,
    level: "error",
    platform: "javascript",
    exception: { values: [{ type: err.name, value: err.message }] },
    extra: extra || {},
    tags: { environment: import.meta.env.PROD ? "production" : "development" },
  };
  const body =
    JSON.stringify({ event_id: payload.event_id, sent_at: new Date().toISOString() }) +
    "\n" +
    JSON.stringify({ type: "event", content_type: "application/json", length: JSON.stringify(payload).length }) +
    "\n" +
    JSON.stringify(payload);
  
  console.log("[Sentry Debug] Sending to:", `https://${host}/api/${projectId}/envelope/`);
  const sent = navigator.sendBeacon(`https://${host}/api/${projectId}/envelope/`, new Blob([body], { type: "text/plain" }));
  console.log("[Sentry Debug] sendBeacon result:", sent);
}

export default component$(() => {
  useVisibleTask$(() => {
    inject({ framework: "qwik" });
    initPostHog();

    console.log("[Sentry Debug] Attaching error listeners, DSN:", SENTRY_DSN ? "SET" : "EMPTY");
    
    window.addEventListener("error", (e) => {
      console.log("[Sentry Debug] onerror triggered", e);
      sendToSentry(e.error || e.message, { source: "onerror", filename: e.filename, lineno: e.lineno });
    });
    window.addEventListener("unhandledrejection", (e) => {
      console.log("[Sentry Debug] unhandledrejection triggered", e);
      sendToSentry(e.reason, { source: "unhandledrejection" });
    });

    (window as any).testSentry = () => {
      console.log("[Sentry Debug] Manual test triggered");
      sendToSentry(new Error("Manual Sentry test"), { source: "manual_test" });
    };
  });

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#101117" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/icon-64.png" type="image/png" sizes="64x64" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="shortcut icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        {commonHeadLinks.map((link) => (
          <link key={`global-link-${link.rel}-${link.href}`} {...link} />
        ))}
        {commonHeadScripts.map((script) => {
          const { key, props, script: content } = script;
          return (
            <script
              key={`global-script-${key}`}
              {...props}
              dangerouslySetInnerHTML={content}
            />
          );
        })}
        <RouterHead />
        <FlowbiteProviderHeader />
      </head>
      <body lang="en">
        <FlowbiteProvider toastPosition="top-right" theme="purple">
          <RouterOutlet />
        </FlowbiteProvider>
      </body>
    </QwikCityProvider>
  );
});
