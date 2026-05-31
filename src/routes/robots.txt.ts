import type { RequestHandler } from "@builder.io/qwik-city";

import { setPublicEdgeCache } from "~/lib/cache";
import { SITE_ORIGIN } from "~/lib/site";

export const onGet: RequestHandler = (event) => {
  setPublicEdgeCache(event);
  event.headers.set("Content-Type", "text/plain; charset=utf-8");
  event.send(
    200,
    [
      "User-agent: *",
      "Allow: /$",
      "Allow: /blog",
      "Allow: /docs",
      "Allow: /platform/benchmarks",
      "Allow: /platform/trust",
      "Allow: /platform/byoc",
      "Allow: /signup",
      "Allow: /login",
      "Disallow: /api/",
      "Disallow: /platform/billing",
      "Disallow: /platform/settings",
      "Disallow: /platform/clusters",
      "Disallow: /logout",
      "",
      `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
      "",
    ].join("\n")
  );
};
