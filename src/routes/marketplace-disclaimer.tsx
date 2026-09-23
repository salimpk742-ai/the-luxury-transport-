import { createFileRoute } from "@tanstack/react-router";
import { DisclaimerBody, Policy } from "@/components/policies";
import { getPageCopy } from "@/lib/marketplace/fns";
import { siteFromMatches, siteTitle } from "@/lib/site";

export const Route = createFileRoute("/marketplace-disclaimer")({
  loader: () => getPageCopy({ data: { key: "disclaimer" } }),
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return {
      meta: [
        { title: siteTitle(site, "Marketplace disclaimer") },
        { name: "description", content: `${site.name} is a marketplace. It does not own the listed cars or guarantee the seller.` },
      ],
      links: [{ rel: "canonical", href: `${site.url}/marketplace-disclaimer` }],
    };
  },
  component: function DisclaimerPage() {
    return (
      <Policy title="Marketplace disclaimer" body={Route.useLoaderData() || ""}>
        <DisclaimerBody />
      </Policy>
    );
  },
});
