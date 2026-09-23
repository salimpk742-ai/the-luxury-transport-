import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { listingSeo, publicHead } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";
import { getListing } from "@/lib/marketplace/fns";
import { DetailView } from "@/components/detail";

export const Route = createFileRoute("/rent/$vehicle/$area/$id")({
  loader: async ({ params }) => {
    const id = Number(params.id);
    const data = await getListing({ data: { id } });
    if (!data || data.listing.type !== "RENT") throw notFound();
    if (data.listing.slugVehicle !== params.vehicle || data.listing.slugArea !== params.area) {
      throw redirect({
        to: "/rent/$vehicle/$area/$id",
        params: { vehicle: data.listing.slugVehicle, area: data.listing.slugArea, id: String(data.listing.id) },
      });
    }
    return data;
  },
  head: ({ matches, loaderData }) => {
    const site = siteFromMatches(matches);
    if (!loaderData) {
      return publicHead(site, { title: `Car rental | ${site.name}`, description: site.description, path: "/rent", index: false });
    }
    return publicHead(site, listingSeo(site, loaderData.listing));
  },
  component: RentListingPage,
});

function RentListingPage() {
  const data = Route.useLoaderData();
  return <DetailView listing={data.listing} similar={data.similar} />;
}
