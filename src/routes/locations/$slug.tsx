import { createFileRoute, Link, notFound, useRouteContext } from "@tanstack/react-router";
import { getPlacePage } from "@/lib/marketplace/fns";
import { ListingCard } from "@/components/listing-card";
import { EmptyState } from "@/components/states";
import { breadcrumbGraph, canonical, publicHead, titled } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";
import type { Listing } from "@/lib/marketplace/types";

export const Route = createFileRoute("/locations/$slug")({
  loader: async ({ params }) => {
    const data = await getPlacePage({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ matches, loaderData, params }) => {
    const site = siteFromMatches(matches);
    const area = loaderData?.place.area ?? "Location";
    const real = loaderData?.result.items.some((item) => !item.isDemo) ?? false;
    return publicHead(site, {
      title: titled(site, `Cars in ${area}`),
      description: loaderData ? `Cars for rent and sale in ${loaderData.place.area}, ${loaderData.place.emirate}. Contact the advertiser directly.` : site.description,
      path: `/locations/${params.slug}`,
      index: real,
    });
  },
  component: LocationPage,
});

function LocationPage() {
  const { place, result } = Route.useLoaderData();
  const { site } = useRouteContext({ from: "__root__" });
  const rent = result.items.filter((item) => item.type === "RENT");
  const sale = result.items.filter((item) => item.type === "SALE");
  const crumbs = [
    { name: "Home", item: canonical(site, "/") },
    { name: place.area },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbGraph(crumbs)) }} />
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span> / </span>
        <span className="text-ink">{place.area}</span>
      </nav>
      <p className="mt-3 text-xs font-medium uppercase tracking-widest text-pine">{place.emirate}</p>
      <h1 className="mt-2 text-4xl text-ink sm:text-5xl">Cars in {place.area}</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        {result.total
          ? `${result.total} active ${result.total === 1 ? "listing" : "listings"} in this area.`
          : `${place.area} is ready for listings. Advertisers can post here as the marketplace grows beyond the first neighbourhoods.`}
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        {place.emirate === "Dubai" && place.scope === "area" && rent.length ? (
          <Link to="/rent/$vehicle/$area" params={{ vehicle: "dubai", area: place.slug }} className="text-pine">Rentals in {place.area}</Link>
        ) : (
          <Link to="/rent" search={place.scope === "area" ? { area: place.slug } : {}} className="text-pine">All rentals</Link>
        )}
        {place.emirate === "Dubai" && place.scope === "area" && sale.length ? (
          <Link to="/buy/$vehicle/$area" params={{ vehicle: "dubai", area: place.slug }} className="text-pine">Cars for sale in {place.area}</Link>
        ) : (
          <Link to="/buy" search={place.scope === "area" ? { area: place.slug } : {}} className="text-pine">All for sale</Link>
        )}
      </div>
      {result.total === 0 ? (
        <div className="mt-8">
          <EmptyState title={`No cars in ${place.area} yet.`} body="Try a nearby Dubai area, or post the first car here." action={<Link to="/post" className="inline-flex h-12 items-center rounded-full bg-pine px-5 text-sm font-medium text-paper">Post your car</Link>} />
        </div>
      ) : (
        <>
          {rent.length ? <Group title="For rent" items={rent} /> : null}
          {sale.length ? <Group title="For sale" items={sale} /> : null}
        </>
      )}
    </div>
  );
}

function Group({ title, items }: { title: string; items: Listing[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-3xl text-ink">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </div>
    </section>
  );
}
