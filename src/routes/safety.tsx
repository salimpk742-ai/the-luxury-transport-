import { createFileRoute } from "@tanstack/react-router";
import { Policy, SafetyBody } from "@/components/policies";
import { getPageCopy } from "@/lib/marketplace/fns";
import { publicHead } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";

export const Route = createFileRoute("/safety")({
  loader: () => getPageCopy({ data: { key: "safety" } }),
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return publicHead(site, {
      title: `Safety | ${site.name}`,
      description: `Practical safety steps for renting or buying through ${site.name}.`,
      path: "/safety",
    });
  },
  component: function SafetyPage() {
    return (
      <Policy title="Safety" body={Route.useLoaderData() || ""}>
        <SafetyBody />
      </Policy>
    );
  },
});
