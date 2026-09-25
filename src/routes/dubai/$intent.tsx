import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { findIntent } from "@/lib/seo-pages";
import { searchCars } from "@/lib/marketplace/fns";
import { parseListingSearch, filteredSearch } from "@/lib/search";
import { publicHead, titled } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";
import { ResultsView } from "@/components/results";

export const Route = createFileRoute("/dubai/$intent")({
  validateSearch: (search) => parseListingSearch(search as Record<string, unknown>),
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const intent = findIntent(params.intent);
    if (!intent) throw notFound();
    const result = await searchCars({
      data: {
        ...deps,
        type: intent.type,
        scope: {
          type: intent.type,
          category: intent.category,
          make: intent.make,
          condition: intent.condition,
        },
      },
    });
    return { intent, result };
  },
  head: ({ matches, loaderData, params, match }) => {
    const site = siteFromMatches(matches);
    const intent = loaderData?.intent;
    return publicHead(site, {
      title: titled(site, intent?.title ?? "Dubai cars"),
      description: intent?.description || site.description,
      path: `/dubai/${params.intent}`,
      // Core SEO hubs must stay indexable. Only hide filtered query-string variants.
      index: !filteredSearch(match.search),
    });
  },
  component: SeoPage,
});

function SeoPage() {
  const { intent, result } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/dubai/$intent" });
  return (
    <ResultsView
      kind={intent.type}
      title={intent.h1}
      lede={intent.description}
      search={search}
      onSearch={(next) => void navigate({ search: next })}
      result={result}
      canonicalPath={`/dubai/${intent.slug}`}
      hideCategory={Boolean(intent.category)}
      hideMake={Boolean(intent.make)}
    />
  );
}
