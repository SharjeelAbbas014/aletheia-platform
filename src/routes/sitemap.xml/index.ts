import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = (event) => {
  event.headers.set("Content-Type", "application/xml; charset=utf-8");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aletheiadb.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://aletheiadb.com/docs/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://aletheiadb.com/blog/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
`;

  event.send(200, body);
};
