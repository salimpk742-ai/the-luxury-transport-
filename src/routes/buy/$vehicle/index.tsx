import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { getLanding } from "@/lib/marketplace/fns";
import { ResultsView } from "@/components/results";
import { siteFromMatches } from "@/lib/site";
import { publicHead, titled } from "@/lib/seo";

export const Route = createFileRoute("/buy/$vehicle/")({
  loader: async ({ params }) => {
    const data = await getLanding({ data: { type: "SALE", makeSlug: params.vehicle } });
    if (!data || data.kind !== "make") throw notFound();
    return data;
  },
  head: ({ matches, loaderData, params }) => {
    const site = siteFromMatches(matches);
    const name = loaderData?.make || "Cars";
    return publicHead(site, {
      title: titled(site, `${name} for Sale in Dubai`),
      description: `${name} cars listed for sale in Dubai by dealers, businesses and private sellers.`,
      path: `/buy/${params.vehicle}`,
      index: Boolean(loaderData?.indexable),
    });
  },
  component: function MakeSalePage() {
    const data = Route.useLoaderData();
    const { vehicle } = Route.useParams();
    const navigate = useNavigate();
    return (
      <ResultsView
        kind="SALE"
        title={`${data.make} for sale`}
        lede={`${data.make} listings for sale in Dubai. Confirm mileage, specification and price with the seller.`}
        search={{ make: data.make }}
        onSearch={(next) => void navigate({ to: "/buy", search: next })}
        result={data.result}
        hideMake
        crumbs={[{ href: "/buy", label: "Buy" }, { label: data.make }]}
        canonicalPath={`/buy/${vehicle}`}
      />
    );
  },
});
