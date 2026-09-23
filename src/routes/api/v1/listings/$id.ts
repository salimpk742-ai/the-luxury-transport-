import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/v1/listings/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = Number(params.id);
        const { getPublicListing } = await import("@/lib/marketplace/queries.server");
        const data = await getPublicListing(id);
        if (!data) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json(data);
      },
    },
  },
});
