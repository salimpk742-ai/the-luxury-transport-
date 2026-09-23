import { createFileRoute } from "@tanstack/react-router";
import { CookieBody, Policy } from "@/components/policies";
import { getPageCopy } from "@/lib/marketplace/fns";
import { siteFromMatches, siteTitle } from "@/lib/site";

export const Route = createFileRoute("/cookie-policy")({
  loader: () => getPageCopy({ data: { key: "cookies" } }),
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return {
      meta: [
        { title: siteTitle(site, "Cookie policy") },
        { name: "description", content: `Essential cookies on ${site.name}. No advertising cookies.` },
      ],
      links: [{ rel: "canonical", href: `${site.url}/cookie-policy` }],
    };
  },
  component: function CookiePage() {
    return (
      <Policy title="Cookie policy" body={Route.useLoaderData() || ""}>
        <CookieBody />
      </Policy>
    );
  },
});
