import { createFileRoute } from "@tanstack/react-router";
import { Policy, SafetyBody } from "@/components/policies";
import { getPageCopy } from "@/lib/marketplace/fns";
import { siteFromMatches, siteTitle } from "@/lib/site";

export const Route = createFileRoute("/safety")({
  loader: () => getPageCopy({ data: { key: "safety" } }),
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return {
      meta: [
        { title: siteTitle(site, "Safety") },
        { name: "description", content: `Practical safety steps for renting or buying through ${site.name}.` },
      ],
      links: [{ rel: "canonical", href: `${site.url}/safety` }],
    };
  },
  component: function SafetyPage() {
    return (
      <Policy title="Safety" body={Route.useLoaderData() || ""}>
        <SafetyBody />
      </Policy>
    );
  },
});
