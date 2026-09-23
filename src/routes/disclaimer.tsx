import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/disclaimer")({
  beforeLoad: () => {
    throw redirect({ to: "/marketplace-disclaimer" });
  },
});
