import { createFileRoute } from "@tanstack/react-router";
import { Policy, TermsBody } from "@/components/policies";
import { getPageCopy } from "@/lib/marketplace/fns";
import { siteFromMatches, siteTitle } from "@/lib/site";

export const Route = createFileRoute("/terms-and-conditions")({
  loader: () => getPageCopy({ data: { key: "terms" } }),
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return {
      meta: [
        { title: siteTitle(site, "Terms and conditions") },
        { name: "description", content: `Marketplace terms for ${site.name}. Advertisers and customers contract with each other.` },
      ],
      links: [{ rel: "canonical", href: `${site.url}/terms-and-conditions` }],
    };
  },
  component: function TermsPage() {
    return (
      <Policy title="Terms and conditions" body={Route.useLoaderData() || ""}>
        <TermsBody />
      </Policy>
    );
  },
});
