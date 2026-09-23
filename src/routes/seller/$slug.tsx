import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/seller/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/dealer/$slug", params });
  },
});
