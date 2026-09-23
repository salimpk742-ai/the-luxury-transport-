import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getListing } from "@/lib/marketplace/fns";
import { DetailView } from "@/components/detail";
import { listingSeo, publicHead } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";

export const Route = createFileRoute("/buy/$vehicle/$area/$id")({
  loader: async ({ params }) => {
    const id = Number(params.id);
    const data = await getListing({ data: { id } });
    if (!data || data.listing.type !== "SALE") throw notFound();
    if (data.listing.slugVehicle !== params.vehicle || data.listing.slugArea !== params.area) {
      throw redirect({
        to: "/buy/$vehicle/$area/$id",
        params: { vehicle: data.listing.slugVehicle, area: data.listing.slugArea, id: String(data.listing.id) },
      });
    }
    return data;
  },
  head: ({ matches, loaderData }) => {
    const site = siteFromMatches(matches);
    if (!loaderData) {
      return publicHead(site, { title: `Cars for sale | ${site.name}`, description: site.description, path: "/buy", index: false });
    }
    return publicHead(site, listingSeo(site, loaderData.listing));
  },
  component: BuyListingPage,
});

function BuyListingPage() {
  const data = Route.useLoaderData();
  return <DetailView listing={data.listing} similar={data.similar} />;
}
