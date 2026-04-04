import type { RequestHandler } from "@builder.io/qwik-city";

import { setPublicEdgeCache } from "~/lib/cache";
import { SITE_ORIGIN } from "~/lib/site";

export const onGet: RequestHandler = (event) => {
  setPublicEdgeCache(event);
  event.headers.set("Content-Type", "text/plain; charset=utf-8");
  event.send(
    200,
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`
  );
};
