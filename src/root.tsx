import { component$, useVisibleTask$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet
} from "@builder.io/qwik-city";
import { inject } from "@vercel/analytics";

import { RouterHead } from "./components/router-head/router-head";
import { commonHeadLinks, commonHeadScripts } from "./constants/theme";
import "./global.css";

export default component$(() => {
  useVisibleTask$(() => {
    inject({ framework: "qwik" });
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
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="shortcut icon" href="/favicon-32.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        {commonHeadLinks.map((link) => (
          <link key={`global-link-${link.rel}-${link.href}`} {...link} />
        ))}
        {commonHeadScripts.map((script) => {
          const { script: content, ...props } = script;
          return (
            <script
              key={`global-script-${script.key}`}
              {...props}
              dangerouslySetInnerHTML={content}
            />
          );
        })}
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
