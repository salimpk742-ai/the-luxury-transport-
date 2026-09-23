import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { getLanding } from "@/lib/marketplace/fns";
import { ResultsView } from "@/components/results";
import { siteFromMatches } from "@/lib/site";
import { publicHead, titled } from "@/lib/seo";

export const Route = createFileRoute("/buy/$vehicle/$area/")({
  loader: async ({ params }) => {
    if (params.vehicle === "dubai") {
      const data = await getLanding({ data: { type: "SALE", areaSlug: params.area } });
      if (!data || data.kind !== "area" || !data.place) throw notFound();
      return data;
    }
    const data = await getLanding({ data: { type: "SALE", makeSlug: params.vehicle, modelSlug: params.area } });
    if (!data || data.kind !== "make" || !data.model) throw notFound();
    return data;
  },
  head: ({ matches, loaderData, params }) => {
    const site = siteFromMatches(matches);
    const place = loaderData?.place;
    const title = place
      ? `Cars for Sale in ${place.area}`
      : `${loaderData?.make ?? ""} ${loaderData?.model ?? ""} for Sale in Dubai`.trim();
    const path = place ? `/buy/dubai/${params.area}` : `/buy/${params.vehicle}/${params.area}`;
    return publicHead(site, {
      title: titled(site, title),
      description: place
        ? `Cars for sale in ${place.area}, Dubai. Confirm condition, paperwork and price with the seller.`
        : `${title}. Contact the seller directly.`,
      path,
      index: Boolean(loaderData?.indexable),
    });
  },
  component: function BuySegmentPage() {
    const data = Route.useLoaderData();
    const params = Route.useParams();
    const navigate = useNavigate();
    if (data.kind === "area" && data.place) {
      return (
        <ResultsView
          kind="SALE"
          title={`Cars for sale in ${data.place.area}`}
          lede={`Cars advertised for sale in ${data.place.area}.`}
          search={{ area: data.place.slug }}
          onSearch={(next) => void navigate({ to: "/buy", search: next })}
          result={data.result}
          crumbs={[{ href: "/buy", label: "Buy" }, { label: data.place.area }]}
          canonicalPath={`/buy/dubai/${params.area}`}
        />
      );
    }
    return (
      <ResultsView
        kind="SALE"
        title={`${data.make} ${data.model} for sale`}
        lede={`${data.make} ${data.model} listings for sale in Dubai.`}
        search={{ make: data.make, model: data.model }}
        onSearch={(next) => void navigate({ to: "/buy", search: next })}
        result={data.result}
        hideMake
        crumbs={[{ href: "/buy", label: "Buy" }, { label: data.make }, { label: data.model }]}
        canonicalPath={`/buy/${params.vehicle}/${params.area}`}
      />
    );
  },
});
