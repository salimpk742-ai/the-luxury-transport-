import { createFileRoute } from "@tanstack/react-router";
import { Policy, TermsBody } from "@/components/policies";
import { getPageCopy } from "@/lib/marketplace/fns";
import { publicHead } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";

export const Route = createFileRoute("/terms-and-conditions")({
  loader: () => getPageCopy({ data: { key: "terms" } }),
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return publicHead(site, {
      title: `Terms and conditions | ${site.name}`,
      description: `Marketplace terms for ${site.name}. Advertisers and customers contract with each other.`,
      path: "/terms-and-conditions",
    });
  },
  component: function TermsPage() {
    return (
      <Policy title="Terms and conditions" body={Route.useLoaderData() || ""}>
        <TermsBody />
      </Policy>
    );
  },
});
