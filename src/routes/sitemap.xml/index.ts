import type { RequestHandler } from "@builder.io/qwik-city";

import { getAllBlogPosts } from "~/lib/blog";
import { setPublicEdgeCache } from "~/lib/cache";
import { detailedDocsPages } from "~/lib/docs-content";
import { absoluteUrl, SITE_ORIGIN } from "~/lib/site";

interface SitemapEntry {
  pathname: string;
  changefreq: string;
  priority: string;
  lastmod?: string;
  images?: string[];
}

interface BlogPostWithAssets {
  slug: string;
  url: string;
  title: string;
  updatedAt: string;
  image: string;
}

const ASSET_IMAGES = [
  "/screen.png",
  "/hero-cube.png",
  "/hero-cube.webp",
  "/icon.png",
  "/icon-192.png",
  "/next-decade-ai.webp",
];

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
    changefreq: "weekly",
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
  },
  {
    pathname: "/docs/install",
    changefreq: "monthly",
    priority: "0.7"
  },
  {
    pathname: "/docs/concepts",
    changefreq: "monthly",
    priority: "0.7"
  },
  {
    pathname: "/docs/architecture",
    changefreq: "monthly",
    priority: "0.7"
  },
  {
    pathname: "/docs/data-model",
    changefreq: "monthly",
    priority: "0.6"
  },
  {
    pathname: "/docs/memory-kinds",
    changefreq: "monthly",
    priority: "0.6"
  },
  {
    pathname: "/docs/fact-supersession",
    changefreq: "monthly",
    priority: "0.7"
  },
  {
    pathname: "/signup",
    changefreq: "monthly",
    priority: "0.5"
  },
  {
    pathname: "/login",
    changefreq: "monthly",
    priority: "0.3"
  }
];

const docsEntries: SitemapEntry[] = detailedDocsPages.map((page) => ({
  pathname: `/docs/${page.slug}`,
  changefreq: "monthly",
  priority: "0.7"
}));

const blogEntries: SitemapEntry[] = (getAllBlogPosts() as BlogPostWithAssets[]).map((post) => ({
  pathname: post.url,
  changefreq: "monthly",
  priority: "0.8",
  lastmod: post.updatedAt,
  images: [post.image]
}));

function renderUrl(entry: SitemapEntry): string {
  const lines = [`    <loc>${escapeXml(absoluteUrl(entry.pathname))}</loc>`];
  if (entry.images?.length) {
    for (const img of entry.images) {
      lines.push(`    <image:image><image:loc>${escapeXml(new URL(img, SITE_ORIGIN).toString())}</image:loc></image:image>`);
    }
  }
  lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  lines.push(`    <priority>${entry.priority}</priority>`);
  if (entry.lastmod) {
    lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
  }
  return lines.map((l) => `  ${l}`).join("\n");
}

export const onGet: RequestHandler = (event) => {
  setPublicEdgeCache(event);
  event.headers.set("Content-Type", "application/xml; charset=utf-8");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...staticEntries, ...docsEntries, ...blogEntries]
  .map((entry) => `  <url>\n${renderUrl(entry)}\n  </url>`)
  .join("\n")}
</urlset>
`;

  event.send(200, body);
};
