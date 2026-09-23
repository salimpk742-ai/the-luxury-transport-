import { createFileRoute } from "@tanstack/react-router";
import { SEO_INTENTS } from "@/lib/seo-pages";
import { defaultSite } from "@/lib/site";
import { slugify } from "@/lib/text";

function xml(value: string) {
  return value.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

function day(value: string | undefined) {
  const match = String(value ?? "").match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { readSite, sitemapEntries, searchListings, indexableCatalog } = await import("@/lib/marketplace/queries.server");
        const site = await readSite().catch(() => defaultSite);
        const origin = site.url.replace(/\/$/, "").replace(/^http:\/\//i, "https://");
        const data = await sitemapEntries();
        const urls: { path: string; lastmod?: string }[] = [
          { path: "/" },
          { path: "/rent" },
          { path: "/buy" },
          { path: "/about" },
          { path: "/contact" },
          { path: "/safety" },
          { path: "/marketplace-disclaimer" },
          { path: "/terms-and-conditions" },
          { path: "/privacy-policy" },
          { path: "/cookie-policy" },
        ];
        for (const row of data.listings) {
          const root = row.type === "SALE" ? "buy" : "rent";
          urls.push({ path: `/${root}/${row.slugVehicle}/${row.slugArea}/${row.id}`, lastmod: day(row.updatedAt) });
        }
        for (const dealer of data.dealers) urls.push({ path: `/dealer/${dealer.slug}` });
        const catalog = await indexableCatalog();
        for (const row of catalog.makes) {
          if (row.real >= 2) urls.push({ path: `/${row.type === "SALE" ? "buy" : "rent"}/${slugify(row.make)}` });
        }
        for (const row of catalog.models) {
          if (row.real >= 2) urls.push({ path: `/${row.type === "SALE" ? "buy" : "rent"}/${slugify(row.make)}/${slugify(row.model)}` });
        }
        for (const row of catalog.areas) {
          if (row.real >= 2) urls.push({ path: `/${row.type === "SALE" ? "buy" : "rent"}/dubai/${row.slug}` });
        }
        for (const intent of SEO_INTENTS) {
          const result = await searchListings({ type: intent.type, limit: 24 }, {
            type: intent.type,
            category: intent.category,
            make: intent.make,
            condition: intent.condition === "new" || intent.condition === "used" ? intent.condition : undefined,
          });
          if (result.items.filter((item) => !item.isDemo).length >= 2) urls.push({ path: `/dubai/${intent.slug}` });
        }
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((entry) => {
            const loc = `<loc>${xml(entry.path === "/" ? origin : `${origin}${entry.path}`)}</loc>`;
            const last = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "";
            return `<url>${loc}${last}</url>`;
          })
          .join("\n")}\n</urlset>`;
        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" },
        });
      },
    },
  },
});
