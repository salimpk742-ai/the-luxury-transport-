import { createFileRoute } from "@tanstack/react-router";
import { CookieBody, Policy } from "@/components/policies";
import { getPageCopy } from "@/lib/marketplace/fns";
import { publicHead } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";

export const Route = createFileRoute("/cookie-policy")({
  loader: () => getPageCopy({ data: { key: "cookies" } }),
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return publicHead(site, {
      title: `Cookie policy | ${site.name}`,
      description: `Essential cookies on ${site.name}. No advertising cookies.`,
      path: "/cookie-policy",
    });
  },
  component: function CookiePage() {
    return (
      <Policy title="Cookie policy" body={Route.useLoaderData() || ""}>
        <CookieBody />
      </Policy>
    );
  },
});
