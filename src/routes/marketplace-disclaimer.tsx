import { createFileRoute } from "@tanstack/react-router";
import { DisclaimerBody, Policy } from "@/components/policies";
import { getPageCopy } from "@/lib/marketplace/fns";
import { publicHead } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";

export const Route = createFileRoute("/marketplace-disclaimer")({
  loader: () => getPageCopy({ data: { key: "disclaimer" } }),
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return publicHead(site, {
      title: `Marketplace disclaimer | ${site.name}`,
      description: `${site.name} is a marketplace. It does not own the listed cars or guarantee the seller.`,
      path: "/marketplace-disclaimer",
    });
  },
  component: function DisclaimerPage() {
    return (
      <Policy title="Marketplace disclaimer" body={Route.useLoaderData() || ""}>
        <DisclaimerBody />
      </Policy>
    );
  },
});
