import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { getLanding } from "@/lib/marketplace/fns";
import { ResultsView } from "@/components/results";
import { siteFromMatches } from "@/lib/site";
import { publicHead, titled } from "@/lib/seo";

export const Route = createFileRoute("/rent/$vehicle/")({
  loader: async ({ params }) => {
    const data = await getLanding({ data: { type: "RENT", makeSlug: params.vehicle } });
    if (!data || data.kind !== "make") throw notFound();
    return data;
  },
  head: ({ matches, loaderData, params }) => {
    const site = siteFromMatches(matches);
    const name = loaderData?.make || "Cars";
    return publicHead(site, {
      title: titled(site, `${name} Rental in Dubai`),
      description: `${name} cars listed for rent in Dubai. Compare prices and message the advertiser on WhatsApp.`,
      path: `/rent/${params.vehicle}`,
      index: Boolean(loaderData?.indexable),
    });
  },
  component: function MakeRentPage() {
    const data = Route.useLoaderData();
    const { vehicle } = Route.useParams();
    const navigate = useNavigate();
    return (
      <ResultsView
        kind="RENT"
        title={`${data.make} for rent`}
        lede={`${data.make} listings for rent in Dubai. Prices and availability come from the advertiser.`}
        search={{ make: data.make }}
        onSearch={(next) => void navigate({ to: "/rent", search: next })}
        result={data.result}
        hideMake
        crumbs={[{ href: "/rent", label: "Rent" }, { label: data.make }]}
        canonicalPath={`/rent/${vehicle}`}
      />
    );
  },
});
