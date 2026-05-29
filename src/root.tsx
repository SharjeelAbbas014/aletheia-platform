import { component$, useVisibleTask$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet
} from "@builder.io/qwik-city";
import { inject } from "@vercel/analytics";
import * as Sentry from "@sentry/browser";
import { FlowbiteProvider, FlowbiteProviderHeader } from "flowbite-qwik";

import { RouterHead } from "./components/router-head/router-head";
import { commonHeadLinks, commonHeadScripts } from "./constants/theme";
import { initPostHog } from "./lib/posthog";
import "./global.css";

export default component$(() => {
  useVisibleTask$(() => {
    inject({ framework: "qwik" });
    initPostHog();
    Sentry.init({
      dsn: import.meta.env.PUBLIC_SENTRY_DSN || "",
      environment: import.meta.env.PROD ? "production" : "development",
      tracesSampleRate: 0.2,
      replaysSessionSampleRate: 0.0,
      replaysOnErrorSampleRate: 0.0,
    });
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
