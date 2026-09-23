import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { getLanding } from "@/lib/marketplace/fns";
import { ResultsView } from "@/components/results";
import { siteFromMatches } from "@/lib/site";
import { publicHead, titled } from "@/lib/seo";

export const Route = createFileRoute("/rent/$vehicle/$area/")({
  loader: async ({ params }) => {
    if (params.vehicle === "dubai") {
      const data = await getLanding({ data: { type: "RENT", areaSlug: params.area } });
      if (!data || data.kind !== "area" || !data.place) throw notFound();
      return data;
    }
    const data = await getLanding({ data: { type: "RENT", makeSlug: params.vehicle, modelSlug: params.area } });
    if (!data || data.kind !== "make" || !data.model) throw notFound();
    return data;
  },
  head: ({ matches, loaderData, params }) => {
    const site = siteFromMatches(matches);
    const place = loaderData?.place;
    const title = place
      ? `Car Rental in ${place.area}`
      : `${loaderData?.make ?? ""} ${loaderData?.model ?? ""} Rental in Dubai`.trim();
    const path = place ? `/rent/dubai/${params.area}` : `/rent/${params.vehicle}/${params.area}`;
    const description = place
      ? `Cars for rent in ${place.area}, Dubai. Pickup and delivery terms are set by each advertiser.`
      : `${title}. Prices and availability come from the advertiser.`;
    return publicHead(site, {
      title: titled(site, title),
      description,
      path,
      index: Boolean(loaderData?.indexable),
    });
  },
  component: function RentSegmentPage() {
    const data = Route.useLoaderData();
    const params = Route.useParams();
    const navigate = useNavigate();
    if (data.kind === "area" && data.place) {
      return (
        <ResultsView
          kind="RENT"
          title={`Rent a car in ${data.place.area}`}
          lede={`Rentals with pickup in ${data.place.area}. Delivery is shown only when the advertiser offers it.`}
          search={{ area: data.place.slug }}
          onSearch={(next) => void navigate({ to: "/rent", search: next })}
          result={data.result}
          crumbs={[{ href: "/rent", label: "Rent" }, { label: data.place.area }]}
          canonicalPath={`/rent/dubai/${data.place.slug}`}
        />
      );
    }
    return (
      <ResultsView
        kind="RENT"
        title={`${data.make} ${data.model} for rent`}
        lede={`${data.make} ${data.model} rental listings in Dubai.`}
        search={{ make: data.make, model: data.model }}
        onSearch={(next) => void navigate({ to: "/rent", search: next })}
        result={data.result}
        hideMake
        crumbs={[{ href: "/rent", label: "Rent" }, { label: data.make }, { label: data.model }]}
        canonicalPath={`/rent/${params.vehicle}/${params.area}`}
      />
    );
  },
});
