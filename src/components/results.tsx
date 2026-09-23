import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Drawer } from "vaul";
import { BODY_TYPES, FUELS, SELLER_TYPES, SPECS, TRANSMISSIONS } from "@/lib/catalog";
import type { ListingSearch } from "@/lib/search";
import { searchActive } from "@/lib/search";
import { getDirectories } from "@/lib/marketplace/fns";
import type { Place, SearchResult } from "@/lib/marketplace/types";
import { ListingCard } from "@/components/listing-card";
import { EmptyState } from "@/components/states";
import { SelectInput } from "@/components/ui";
import { Link, useRouteContext } from "@tanstack/react-router";
import { breadcrumbGraph, canonical } from "@/lib/seo";

export function ResultsView({
  kind,
  title,
  lede,
  search,
  onSearch,
  result,
  hideCategory,
  hideMake,
  crumbs,
  canonicalPath,
  note,
}: {
  kind: "RENT" | "SALE";
  title: string;
  lede: string;
  search: ListingSearch;
  onSearch: (next: ListingSearch) => void;
  result: SearchResult;
  hideCategory?: boolean;
  hideMake?: boolean;
  crumbs?: { href?: "/rent" | "/buy"; label: string }[];
  canonicalPath?: string;
  note?: { title: string; body: string };
}) {
  const [open, setOpen] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const active = searchActive(search);
  const set = (patch: Partial<ListingSearch>) => {
    const next: ListingSearch = { ...search, ...patch };
    delete next.page;
    for (const key of Object.keys(patch) as (keyof ListingSearch)[]) {
      if (!next[key]) delete next[key];
    }
    onSearch(next);
  };

  useEffect(() => {
    void getDirectories().then((data) => setPlaces(data.places)).catch(() => setPlaces([]));
  }, []);

  const fields = (
    <FilterFields kind={kind} search={search} result={result} places={places} hideCategory={hideCategory} hideMake={hideMake} onChange={set} />
  );
  const { site } = useRouteContext({ from: "__root__" });
  const section = kind === "RENT" ? "Rent" : "Buy";
  const sectionPath = kind === "RENT" ? "/rent" : "/buy";
  const pagePath = canonicalPath || sectionPath;
  const extra = (crumbs ?? []).filter((crumb) => crumb.label !== "Home" && crumb.label !== "Rent" && crumb.label !== "Buy");
  const trail: { name: string; item?: string }[] = [
    { name: "Home", item: canonical(site, "/") },
    { name: section, item: canonical(site, extra.length ? sectionPath : pagePath) },
    ...extra.map((crumb, index) => ({
      name: crumb.label,
      item: index === extra.length - 1 ? canonical(site, pagePath) : undefined,
    })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="max-w-2xl">
        <nav className="mb-3 text-sm text-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-ink">Home</Link>
          <span> / </span>
          {extra.length ? <Link to={sectionPath} className="hover:text-ink">{section}</Link> : <span className="text-ink">{section}</span>}
          {extra.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`}>
              <span> / </span>
              <span className="text-ink">{crumb.label}</span>
            </span>
          ))}
        </nav>
        <h1 className="text-4xl text-ink sm:text-5xl">{title}</h1>
        <p className="mt-3 text-ink-soft">{lede}</p>
      </header>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm lg:hidden">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters{active ? ` (${active})` : ""}
        </button>
        <label className="ml-auto text-sm text-muted">
          <span className="sr-only">Sort</span>
          <select
            value={search.sort ?? "newest"}
            onChange={(event) => {
              const value = event.target.value;
              set({ sort: value === "newest" ? undefined : (value as ListingSearch["sort"]) });
            }}
            className="h-11 rounded-full border border-line bg-card px-3"
          >
            <option value="newest">Newest</option>
            <option value="relevant">Most relevant</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="featured">Featured</option>
          </select>
        </label>
      </div>
      <p className="mt-3 text-sm text-muted">
        {result.total} {result.total === 1 ? "car" : "cars"}
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-4 overflow-auto rounded-3xl border border-line bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-ink">Filters</h2>
              {active ? (
                <button type="button" className="text-sm text-pine" onClick={() => onSearch({})}>
                  Clear
                </button>
              ) : null}
            </div>
            {fields}
          </div>
        </aside>
        <div>
          {result.items.length === 0 ? (
            <EmptyState
              title="No cars found matching your search."
              body="Try changing your price range or removing a filter."
              action={
                <button type="button" className="h-12 rounded-full bg-pine px-5 text-sm font-medium text-paper" onClick={() => onSearch({})}>
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {result.items.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
          {result.pages > 1 ? (
            <div className="mt-6 flex items-center justify-between text-sm">
              <button type="button" disabled={result.page <= 1} className="h-11 rounded-full border border-line px-4 disabled:opacity-40" onClick={() => onSearch({ ...search, page: result.page > 2 ? String(result.page - 1) : undefined })}>
                Previous
              </button>
              <span className="text-muted">
                Page {result.page} of {result.pages}
              </span>
              <button type="button" disabled={result.page >= result.pages} className="h-11 rounded-full border border-line px-4 disabled:opacity-40" onClick={() => onSearch({ ...search, page: String(result.page + 1) })}>
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {note ? (
        <section className="mt-12 max-w-2xl">
          <h2 className="text-2xl text-ink">{note.title}</h2>
          <p className="mt-3 text-sm leading-6 text-ink-soft">{note.body}</p>
        </section>
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbGraph(trail)) }} />
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/40" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl bg-card">
            <div className="flex items-center justify-between px-4 py-3">
              <Drawer.Title className="text-lg text-ink">Filters</Drawer.Title>
              <button type="button" className="text-sm text-pine" onClick={() => { onSearch({}); setOpen(false); }}>Clear</button>
            </div>
            <div className="space-y-4 overflow-auto px-4 pb-4">{fields}</div>
            <div className="border-t border-line p-4">
              <button type="button" className="h-12 w-full rounded-full bg-pine text-sm font-medium text-paper" onClick={() => setOpen(false)}>
                Show {result.total} cars
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      <p className="sr-only">
        <Link to={kind === "RENT" ? "/rent" : "/buy"}>Reset</Link>
      </p>
    </div>
  );
}

function FilterFields({
  kind,
  search,
  result,
  places,
  hideCategory,
  hideMake,
  onChange,
}: {
  kind: "RENT" | "SALE";
  search: ListingSearch;
  result: SearchResult;
  places: Place[];
  hideCategory?: boolean;
  hideMake?: boolean;
  onChange: (patch: Partial<ListingSearch>) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Keyword</span>
        <input value={search.q ?? ""} onChange={(event) => onChange({ q: event.target.value })} placeholder="Range Rover" className="h-11 w-full rounded-2xl border border-line px-3" />
      </label>
      {hideMake ? null : (
        <Choice label="Make" value={search.make ?? ""} onChange={(make) => onChange({ make })} options={result.facets.makes.map((item) => ({ value: item.name, label: `${item.name} (${item.n})` }))} />
      )}
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Model</span>
        <input value={search.model ?? ""} onChange={(event) => onChange({ model: event.target.value })} placeholder="G-Class" className="h-11 w-full rounded-2xl border border-line px-3" />
      </label>
      {hideCategory ? null : (
        <Choice label="Category" value={search.category ?? ""} onChange={(category) => onChange({ category })} options={result.facets.categories.map((item) => ({ value: item.slug ?? item.name, label: `${item.name} (${item.n})` }))} />
      )}
      <AreaField search={search} result={result} places={places} onChange={onChange} />
      <Choice label="Transmission" value={search.transmission ?? ""} onChange={(transmission) => onChange({ transmission })} options={TRANSMISSIONS.map((item) => ({ value: item, label: item }))} />
      <Choice label="Fuel" value={search.fuel ?? ""} onChange={(fuel) => onChange({ fuel })} options={FUELS.map((item) => ({ value: item, label: item }))} />
      <Choice label="Body" value={search.body ?? ""} onChange={(body) => onChange({ body })} options={BODY_TYPES.map((item) => ({ value: item, label: item }))} />
      {kind === "SALE" ? (
        <>
          <Choice label="Seller" value={search.seller ?? ""} onChange={(seller) => onChange({ seller })} options={SELLER_TYPES.map((item) => ({ value: item, label: item }))} />
          <Choice label="Condition" value={search.condition ?? ""} onChange={(condition) => onChange({ condition })} options={[{ value: "used", label: "Used" }, { value: "new", label: "New" }]} />
          <Choice label="Specification" value={search.spec ?? ""} onChange={(spec) => onChange({ spec })} options={SPECS.map((item) => ({ value: item, label: item }))} />
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Colour</span>
            <input value={search.color ?? ""} onChange={(event) => onChange({ color: event.target.value })} className="h-11 w-full rounded-2xl border border-line px-3" />
          </label>
        </>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <Num label={kind === "RENT" ? "Daily from" : "Price from"} value={search.priceMin ?? ""} onChange={(priceMin) => onChange({ priceMin })} />
        <Num label={kind === "RENT" ? "Daily to" : "Price to"} value={search.priceMax ?? ""} onChange={(priceMax) => onChange({ priceMax })} />
      </div>
      {kind === "RENT" ? (
        <>
          <Num label="Weekly up to" value={search.weeklyMax ?? ""} onChange={(weeklyMax) => onChange({ weeklyMax })} />
          <Num label="Monthly up to" value={search.monthlyMax ?? ""} onChange={(monthlyMax) => onChange({ monthlyMax })} />
          <Num label="Deposit up to" value={search.depositMax ?? ""} onChange={(depositMax) => onChange({ depositMax })} />
          <Num label="Mileage up to" value={search.mileageMax ?? ""} onChange={(mileageMax) => onChange({ mileageMax })} />
          <Choice label="Driver" value={search.driver ?? ""} onChange={(driver) => onChange({ driver: driver === "yes" || driver === "no" ? driver : "" })} options={[{ value: "yes", label: "With driver" }, { value: "no", label: "Self-drive" }]} />
          <Choice label="Delivery" value={search.delivery ?? ""} onChange={(delivery) => onChange({ delivery: delivery === "yes" || delivery === "dubai" || delivery === "airport" ? delivery : "" })} options={[{ value: "yes", label: "Delivery offered" }, { value: "dubai", label: "Dubai-wide delivery" }, { value: "airport", label: "Airport delivery" }]} />
        </>
      ) : (
        <Num label="Mileage up to" value={search.mileageMax ?? ""} onChange={(mileageMax) => onChange({ mileageMax })} />
      )}
      <div className="grid grid-cols-2 gap-2">
        <Num label="Year from" value={search.yearMin ?? ""} onChange={(yearMin) => onChange({ yearMin })} />
        <Num label="Year to" value={search.yearMax ?? ""} onChange={(yearMax) => onChange({ yearMax })} />
      </div>
      <Choice label="Seats at least" value={search.seats ?? ""} onChange={(seats) => onChange({ seats })} options={["2", "4", "5", "7"].map((item) => ({ value: item, label: item }))} />
    </div>
  );
}

function AreaField({
  search,
  result,
  places,
  onChange,
}: {
  search: ListingSearch;
  result: SearchResult;
  places: Place[];
  onChange: (patch: Partial<ListingSearch>) => void;
}) {
  if (!places.length) {
    return <Choice label="Location" value={search.area ?? ""} onChange={(area) => onChange({ area })} options={result.facets.areas.map((item) => ({ value: item.slug ?? item.name, label: `${item.name} (${item.n})` }))} />;
  }
  const groups = new Map<string, Place[]>();
  for (const place of places) {
    const list = groups.get(place.emirate) ?? [];
    list.push(place);
    groups.set(place.emirate, list);
  }
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">Location</span>
      <SelectInput value={search.area ?? ""} onChange={(event) => onChange({ area: event.target.value })}>
        <option value="">Any</option>
        {[...groups.entries()].map(([emirate, items]) => (
          <optgroup key={emirate} label={emirate}>
            {items.map((place) => (
              <option key={place.slug} value={place.slug}>
                {place.scope === "emirate" ? `All of ${place.area}` : place.parentSlug ? `– ${place.area}` : place.area}
              </option>
            ))}
          </optgroup>
        ))}
      </SelectInput>
    </label>
  );
}

function Choice({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <SelectInput value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </SelectInput>
    </label>
  );
}

function Num({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <input inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))} className="h-11 w-full rounded-2xl border border-line px-3 tabular-nums" />
    </label>
  );
}
