import { createFileRoute } from "@tanstack/react-router";
import { parseListingSearch } from "@/lib/search";

export const Route = createFileRoute("/api/v1/listings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const query = Object.fromEntries(url.searchParams.entries());
        const type = query.type === "RENT" || query.type === "SALE" ? query.type : undefined;
        const { searchListings } = await import("@/lib/marketplace/queries.server");
        const result = await searchListings({ ...parseListingSearch(query), type }, { type });
        return Response.json({
          items: result.items,
          total: result.total,
          page: result.page,
          pages: result.pages,
        });
      },
    },
  },
});
