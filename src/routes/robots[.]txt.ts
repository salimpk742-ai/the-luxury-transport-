import { createFileRoute } from "@tanstack/react-router";
import { defaultSite } from "@/lib/site";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const { readSite } = await import("@/lib/marketplace/queries.server");
        const site = await readSite().catch(() => defaultSite);
        const origin = site.url.replace(/\/$/, "").replace(/^http:\/\//i, "https://");
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /account",
          "Disallow: /post",
          "Disallow: /login",
          "Disallow: /api/",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
