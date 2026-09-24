import { createFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useEffect } from "react";
import { searchCars, trackPublic } from "@/lib/marketplace/fns";
import { parseListingSearch, filteredSearch } from "@/lib/search";
import { siteFromMatches } from "@/lib/site";
import { publicHead } from "@/lib/seo";
import { ResultsView } from "@/components/results";

export const Route = createFileRoute("/rent/")({
  validateSearch: (search) => parseListingSearch(search as Record<string, unknown>),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => searchCars({ data: { ...deps, type: "RENT", scope: { type: "RENT" } } }),
  head: ({ matches, match }) => {
    const site = siteFromMatches(matches);
    return publicHead(site, {
      title: `Car rental in Dubai | ${site.name}`,
      description: `Search cars for rent in Dubai on ${site.name}. Compare daily, weekly and monthly prices, then message the advertiser on WhatsApp.`,
      path: "/rent",
      index: !filteredSearch(match.search),
    });
  },
  component: RentPage,
});

function RentPage() {
  const result = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/rent/" });
  const { site } = useRouteContext({ from: "__root__" });
  useEffect(() => {
    if (!search.q) return;
    void trackPublic({ data: { event: "search", listingId: null, meta: { q: search.q, type: "RENT" } } });
  }, [search.q]);
  return (
    <ResultsView
      kind="RENT"
      title="Cars for rent"
      lede={`Daily, weekly and monthly cars from rental companies and dealers. ${result.total} listed on ${site.name} right now.`}
      search={search}
      onSearch={(next) => void navigate({ search: next })}
      result={result}
      canonicalPath="/rent"
      note={{
        title: "Car rental in Dubai",
        body: `${site.name} lists daily, weekly and monthly rentals from rental companies, dealers, businesses and private sellers across Dubai. You contact the advertiser directly. The marketplace does not own the cars.`,
      }}
    />
  );
}
