import type { RequestHandler } from "@builder.io/qwik-city";

import { getAllBlogPosts } from "~/lib/blog";
import { setPublicEdgeCache } from "~/lib/cache";
import { detailedDocsPages } from "~/lib/docs-content";
import { absoluteUrl } from "~/lib/site";

interface SitemapEntry {
  pathname: string;
  changefreq: string;
  priority: string;
  lastmod?: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const staticEntries: SitemapEntry[] = [
  {
    pathname: "/",
    changefreq: "weekly",
    priority: "1.0"
  },
  {
    pathname: "/docs",
    changefreq: "weekly",
    priority: "0.9"
  },
  {
    pathname: "/docs/quickstart",
    changefreq: "monthly",
    priority: "0.8"
  },
  {
    pathname: "/docs/local-engine",
    changefreq: "monthly",
    priority: "0.7"
  },
  {
    pathname: "/docs/security",
    changefreq: "monthly",
    priority: "0.7"
  },
  {
    pathname: "/docs/api-auth",
    changefreq: "monthly",
    priority: "0.7"
  },
  {
    pathname: "/blog",
    changefreq: "weekly",
    priority: "0.9"
  }
];

const docsEntries: SitemapEntry[] = detailedDocsPages.map((page) => ({
  pathname: `/docs/${page.slug}`,
  changefreq: "monthly",
  priority: "0.7"
}));

const blogEntries: SitemapEntry[] = getAllBlogPosts().map((post) => ({
  pathname: post.url,
  changefreq: "monthly",
  priority: "0.8",
  lastmod: post.updatedAt
}));

export const onGet: RequestHandler = (event) => {
  setPublicEdgeCache(event);
  event.headers.set("Content-Type", "application/xml; charset=utf-8");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...docsEntries, ...blogEntries]
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(absoluteUrl(entry.pathname))}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
${entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n` : ""}  </url>`
  )
  .join("\n")}
</urlset>
`;

  event.send(200, body);
};
