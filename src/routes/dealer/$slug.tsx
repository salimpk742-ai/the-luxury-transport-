import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { getDealer } from "@/lib/marketplace/fns";
import { accountTypeLabel } from "@/lib/format";
import { ListingCard } from "@/components/listing-card";
import { EmptyState } from "@/components/states";
import { Monogram } from "@/components/ui";
import { publicHead, titled } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";
import type { Listing } from "@/lib/marketplace/types";

export const Route = createFileRoute("/dealer/$slug")({
  loader: async ({ params }) => {
    const data = await getDealer({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ matches, loaderData, params }) => {
    const site = siteFromMatches(matches);
    const company = loaderData?.company;
    return publicHead(site, {
      title: titled(site, company?.name ?? "Advertiser"),
      description: company?.description?.slice(0, 160) || `Vehicles listed by this advertiser on ${site.name}.`,
      path: `/dealer/${params.slug}`,
      index: Boolean(company && !company.isDemo),
    });
  },
  component: DealerPage,
});

function DealerPage() {
  const { company, listings } = Route.useLoaderData();
  const rent = listings.filter((item) => item.type === "RENT");
  const sale = listings.filter((item) => item.type === "SALE");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-start gap-4">
        {company.logoUrl ? (
          <img src={company.logoUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <Monogram name={company.name} className="h-16 w-16 text-xl" />
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-4xl text-ink">{company.name}</h1>
            {company.verified && !company.isDemo ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-foam px-2 py-1 text-xs font-medium text-pine">
                <BadgeCheck className="size-4" aria-hidden="true" /> Verified business
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted">{accountTypeLabel(company.accountType)} · {company.area}, {company.emirate}</p>
        </div>
      </div>
      <p className="mt-5 max-w-2xl text-ink-soft">{company.description}</p>
      {company.isDemo ? (
        <p className="mt-3 max-w-2xl rounded-2xl bg-sand px-4 py-3 text-sm text-ink">
          Sample profile used to show a public advertiser page. {company.verified ? "The verified badge on this profile is a demonstration. No trade licence was reviewed and no government approval is claimed." : "This sample advertiser is intentionally not verified."}
        </p>
      ) : null}
      {company.website ? <a href={company.website} className="mt-3 inline-block text-sm text-pine" rel="nofollow noopener noreferrer">{company.website}</a> : null}
      {listings.length === 0 ? (
        <div className="mt-8"><EmptyState title="No active listings" body="This advertiser does not have a live car right now." /></div>
      ) : null}
      {rent.length ? <Grid title="For rent" items={rent} /> : null}
      {sale.length ? <Grid title="For sale" items={sale} /> : null}
      <p className="mt-8 text-sm text-muted">
        Contact options on each listing go to the advertiser. <Link to="/safety" className="text-pine">Read the safety notes</Link> before you pay a deposit.
      </p>
    </div>
  );
}

function Grid({ title, items }: { title: string; items: Listing[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-3xl text-ink">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </div>
    </section>
  );
}
