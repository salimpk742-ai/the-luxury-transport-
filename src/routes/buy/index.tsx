import { createFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useEffect } from "react";
import { searchCars, trackPublic } from "@/lib/marketplace/fns";
import { parseListingSearch, filteredSearch } from "@/lib/search";
import { siteFromMatches } from "@/lib/site";
import { publicHead } from "@/lib/seo";
import { ResultsView } from "@/components/results";

export const Route = createFileRoute("/buy/")({
  validateSearch: (search) => parseListingSearch(search as Record<string, unknown>),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => searchCars({ data: { ...deps, type: "SALE", scope: { type: "SALE" } } }),
  head: ({ matches, match }) => {
    const site = siteFromMatches(matches);
    return publicHead(site, {
      title: `Cars for sale in Dubai | ${site.name}`,
      description: `Search cars for sale in Dubai on ${site.name}, from dealers, businesses and private sellers. Confirm the vehicle and the terms with the seller before you pay.`,
      path: "/buy",
      index: !filteredSearch(match.search),
    });
  },
  component: BuyPage,
});

function BuyPage() {
  const result = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/buy/" });
  const { site } = useRouteContext({ from: "__root__" });
  useEffect(() => {
    if (!search.q) return;
    void trackPublic({ data: { event: "search", listingId: null, meta: { q: search.q, type: "SALE" } } });
  }, [search.q]);
  return (
    <ResultsView
      kind="SALE"
      title="Cars for sale"
      lede={`Used and new cars listed by dealers and private sellers. ${result.total} on ${site.name} right now.`}
      search={search}
      onSearch={(next) => void navigate({ search: next })}
      result={result}
      canonicalPath="/buy"
      note={{
        title: "Cars for sale in Dubai",
        body: `Dealers, businesses and private sellers list vehicles for sale on ${site.name}. Compare the price, mileage and specification, then contact the seller directly. Confirm identity, condition and paperwork before you pay. The marketplace is not the seller.`,
      }}
    />
  );
}
