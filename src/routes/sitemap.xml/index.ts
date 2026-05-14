import type { RequestHandler } from "@builder.io/qwik-city";
import { getAllBlogPosts } from "~/lib/blog";

const SITE = "https://aletheiadb.com";

const staticPages = [
  { loc: "/", priority: 1.0 },
  { loc: "/docs/", priority: 0.9 },
  { loc: "/docs/quickstart/", priority: 0.8 },
  { loc: "/docs/api-auth/", priority: 0.8 },
  { loc: "/docs/security/", priority: 0.8 },
  { loc: "/docs/local-engine/", priority: 0.8 },
  { loc: "/blog/", priority: 0.9 },
  { loc: "/platform/benchmarks/", priority: 0.7 },
  { loc: "/platform/trust/", priority: 0.7 },
  { loc: "/platform/byoc/", priority: 0.7 },
];

export const onGet: RequestHandler = (event) => {
  const blogPosts = getAllBlogPosts();

  const urls = [
    ...staticPages,
    ...blogPosts.map((post) => ({
      loc: post.url,
      priority: 0.8,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (u) => `<url>
    <loc>${SITE}${u.loc}</loc>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n  ")}
</urlset>`;

  event.send(
    new Response(body, {
      status: 200,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    })
  );
};
