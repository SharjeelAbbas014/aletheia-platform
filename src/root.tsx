import { component$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet
} from "@builder.io/qwik-city";

import { RouterHead } from "./components/router-head/router-head";
import { commonHeadLinks, commonHeadScripts } from "./constants/theme";
import "./global.css";

export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="icon" href="/icon.png" type="image/png" sizes="32x32" />
        <link rel="shortcut icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta property="og:image" content="/logo-no-bg.png" />
        <meta name="twitter:image" content="/logo-no-bg.png" />
        {commonHeadLinks.map((link) => (
          <link key={`global-link-${link.rel}-${link.href}`} {...link} />
        ))}
        {commonHeadScripts.map((script) => (
          <script
            key={`global-script-${script.key}`}
            {...script.props}
            dangerouslySetInnerHTML={script.script}
          />
        ))}
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
