import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/report")({
  validateSearch: (search) => {
    const listing = typeof search.listing === "string" ? search.listing.replace(/\D/g, "").slice(0, 12) : "";
    return listing ? { listing } : {};
  },
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/report-listing", search });
  },
});
