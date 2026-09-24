import { createFileRoute } from "@tanstack/react-router";
import { Policy, PrivacyBody } from "@/components/policies";
import { getPageCopy } from "@/lib/marketplace/fns";
import { publicHead } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";

export const Route = createFileRoute("/privacy-policy")({
  loader: () => getPageCopy({ data: { key: "privacy" } }),
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return publicHead(site, {
      title: `Privacy policy | ${site.name}`,
      description: `How ${site.name} handles accounts, listings, photos, and contact details.`,
      path: "/privacy-policy",
    });
  },
  component: function PrivacyPage() {
    return (
      <Policy title="Privacy policy" body={Route.useLoaderData() || ""}>
        <PrivacyBody />
      </Policy>
    );
  },
});

