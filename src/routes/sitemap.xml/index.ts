import type { RequestHandler } from "@builder.io/qwik-city";
import { getAllBlogPosts } from "~/lib/blog";
import { absoluteUrl } from "~/lib/site";

const today = new Date().toISOString().split("T")[0];

const staticPages = [
  { loc: "/", priority: 1.0, lastmod: today },
  { loc: "/blog/", priority: 0.9, lastmod: today },
  { loc: "/platform/benchmarks/", priority: 0.7, lastmod: today },
  { loc: "/platform/trust/", priority: 0.7, lastmod: today },
  { loc: "/platform/byoc/", priority: 0.7, lastmod: today },
];

const docsPages = [
  { loc: "/docs/", priority: 0.9 },
  { loc: "/docs/quickstart/", priority: 0.8 },
  { loc: "/docs/install/", priority: 0.8 },
  { loc: "/docs/concepts/", priority: 0.8 },
  { loc: "/docs/architecture/", priority: 0.8 },
  { loc: "/docs/data-model/", priority: 0.7 },
  { loc: "/docs/memory-kinds/", priority: 0.7 },
  { loc: "/docs/id-conventions/", priority: 0.6 },
  { loc: "/docs/ingestion-pipeline/", priority: 0.7 },
  { loc: "/docs/vector-index/", priority: 0.7 },
  { loc: "/docs/lexical-index/", priority: 0.7 },
  { loc: "/docs/reranking/", priority: 0.7 },
  { loc: "/docs/time-ranking/", priority: 0.7 },
  { loc: "/docs/fact-supersession/", priority: 0.7 },
  { loc: "/docs/api-auth/", priority: 0.8 },
  { loc: "/docs/api-ingest/", priority: 0.7 },
  { loc: "/docs/api-query-semantic/", priority: 0.7 },
  { loc: "/docs/api-query-temporal/", priority: 0.7 },
  { loc: "/docs/api-delete/", priority: 0.6 },
  { loc: "/docs/sdk-javascript/", priority: 0.7 },
  { loc: "/docs/sdk-python/", priority: 0.7 },
  { loc: "/docs/local-engine/", priority: 0.8 },
  { loc: "/docs/deployment/", priority: 0.7 },
  { loc: "/docs/observability/", priority: 0.6 },
  { loc: "/docs/benchmarking/", priority: 0.7 },
  { loc: "/docs/security/", priority: 0.8 },
  { loc: "/docs/troubleshooting/", priority: 0.6 },
  { loc: "/docs/glossary/", priority: 0.5 },
  { loc: "/docs/core/", priority: 0.7 },
  { loc: "/docs/platform/", priority: 0.7 },
  { loc: "/docs/memory-proxy/", priority: 0.7 },
  { loc: "/docs/cognitive-extraction/", priority: 0.6 },
  { loc: "/docs/analytics-api/", priority: 0.6 },
  { loc: "/docs/context-templates/", priority: 0.6 },
  { loc: "/docs/rate-limiting/", priority: 0.5 },
  { loc: "/docs/connectors/", priority: 0.6 },
  { loc: "/docs/mcp-server/", priority: 0.7 },
  { loc: "/docs/self-hosting/", priority: 0.7 },
];

export const onGet: RequestHandler = (event) => {
  const blogPosts = getAllBlogPosts();

  const urls = [
    ...staticPages,
    ...docsPages.map((p) => ({ ...p, lastmod: today })),
    ...blogPosts.map((post) => ({
      loc: post.url,
      priority: 0.8,
      lastmod: post.updatedAt || post.publishedAt,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (u) => `<url>
    <loc>${absoluteUrl(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
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
