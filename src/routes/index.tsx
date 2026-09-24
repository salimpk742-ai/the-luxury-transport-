import { createFileRoute, Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BadgeCheck, MessageCircle, Search, ShieldCheck } from "lucide-react";
import { MAKES } from "@/lib/catalog";
import { getHome } from "@/lib/marketplace/fns";
import { ListingCard } from "@/components/listing-card";
import { homeDescription, homeTitle, organizationGraph, publicHead } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: () => getHome(),
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return publicHead(site, { title: homeTitle(site), description: homeDescription(site), path: "/" });
  },
  component: Home,
});

const categoryLinks: Record<string, { to: "/dubai/$intent"; intent: string } | { to: "/rent"; search: { category: string } }> = {
  luxury: { to: "/dubai/$intent", intent: "luxury-car-rental" },
  suv: { to: "/dubai/$intent", intent: "suv-rental" },
  sports: { to: "/dubai/$intent", intent: "sports-car-rental" },
};

function Home() {
  const data = Route.useLoaderData();
  const { site } = useRouteContext({ from: "__root__" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"RENT" | "SALE">("RENT");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [area, setArea] = useState("");
  const [price, setPrice] = useState("");
  const popularCars = [
    { label: "Mercedes G63", make: "Mercedes-Benz", model: "G-Class" },
    { label: "Lamborghini Urus", make: "Lamborghini", model: "Urus" },
    { label: "Range Rover", make: "Range Rover", model: "" },
    { label: "Porsche 911", make: "Porsche", model: "911" },
    { label: "Mercedes GLE", make: "Mercedes-Benz", model: "GLE" },
    { label: "BMW X5", make: "BMW", model: "X5" },
    { label: "Ferrari Roma", make: "Ferrari", model: "Roma" },
    { label: "Land Cruiser", make: "Toyota", model: "Land Cruiser" },
    { label: "Nissan Patrol", make: "Nissan", model: "Patrol" },
    { label: "Rolls-Royce", make: "Rolls-Royce", model: "" },
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationGraph(site)) }} />
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-4 pt-8 lg:grid-cols-2 lg:pt-14">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-pine">Dubai automotive marketplace</p>
          <h1 className="mt-3 text-5xl leading-tight text-ink sm:text-6xl">{site.tagline}</h1>
          <p className="mt-4 max-w-md text-lg text-ink-soft">
            Rent or buy from rental companies, dealers, businesses and private sellers across Dubai.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link to="/rent" className="inline-flex h-12 items-center justify-center rounded-full bg-pine text-sm font-medium text-paper">Rent a car</Link>
            <Link to="/buy" className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-card text-sm font-medium text-ink">Buy a car</Link>
          </div>
        </div>
        <figure className="relative">
          <img src="/media/hero.jpg" alt="Black Mercedes-Benz G63 parked along Dubai Marina at dusk" width={1600} height={900} fetchPriority="high" decoding="async" className="aspect-video w-full rounded-3xl object-cover" />
          <figcaption className="absolute bottom-3 left-3 rounded-2xl bg-card/95 px-3 py-2 text-sm text-ink">
            {data.total} live {data.total === 1 ? "listing" : "listings"} · {data.rentCount} for rent · {data.saleCount} for sale
          </figcaption>
        </figure>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <form
          className="rounded-3xl border border-line bg-card p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const search = {
              make: make || undefined,
              model: model || undefined,
              area: area || undefined,
              priceMax: price || undefined,
            };
            void navigate({ to: mode === "RENT" ? "/rent" : "/buy", search });
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl text-ink">What are you looking for?</h2>
            <div className="grid grid-cols-2 rounded-full bg-sand p-1">
              <button type="button" onClick={() => setMode("RENT")} className={`h-10 rounded-full px-4 text-sm ${mode === "RENT" ? "bg-pine text-paper" : "text-ink"}`}>Rent</button>
              <button type="button" onClick={() => setMode("SALE")} className={`h-10 rounded-full px-4 text-sm ${mode === "SALE" ? "bg-pine text-paper" : "text-ink"}`}>Buy</button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-sm">
              <span className="mb-1 block text-muted">Make</span>
              <select value={make} onChange={(event) => setMake(event.target.value)} className="h-12 w-full rounded-2xl border border-line bg-paper px-3">
                <option value="">Any make</option>
                {MAKES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted">Model</span>
              <input value={model} onChange={(event) => setModel(event.target.value)} placeholder="Land Cruiser" className="h-12 w-full rounded-2xl border border-line bg-paper px-3" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted">Location</span>
              <select value={area} onChange={(event) => setArea(event.target.value)} className="h-12 w-full rounded-2xl border border-line bg-paper px-3">
                <option value="">Anywhere in the directory</option>
                {Array.from(data.places.reduce((map, place) => {
                  const list = map.get(place.emirate) ?? [];
                  list.push(place);
                  map.set(place.emirate, list);
                  return map;
                }, new Map<string, typeof data.places>())).map(([emirate, items]) => (
                  <optgroup key={emirate} label={emirate}>
                    {items.map((place) => (
                      <option key={place.slug} value={place.slug}>
                        {place.scope === "emirate" ? `All of ${place.area}` : place.parentSlug ? `– ${place.area}` : place.area}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted">{mode === "RENT" ? "Daily price up to" : "Price up to"}</span>
              <input inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value.replace(/[^\d]/g, ""))} placeholder="AED" className="h-12 w-full rounded-2xl border border-line bg-paper px-3" />
            </label>
            <button type="submit" className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-pine text-sm font-medium text-paper">
              <Search className="size-4" aria-hidden="true" /> Search cars
            </button>
          </div>
          <div className="mt-4 flex gap-2 overflow-auto pb-1">
            {popularCars.map((car) => (
              <Link key={car.label} to="/rent" search={{ make: car.make, model: car.model || undefined }} className="shrink-0 rounded-full bg-sand px-3 py-2 text-sm text-ink">
                {car.label}
              </Link>
            ))}
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="text-3xl text-ink">Popular categories</h2>
        <div className="mt-4 flex gap-3 overflow-auto pb-2">
          {data.categories.map((category) => {
            const special = categoryLinks[category.slug];
            const className = "shrink-0 rounded-2xl border border-line bg-card px-4 py-3 text-sm font-medium text-ink";
            if (special && special.to === "/dubai/$intent") {
              return <Link key={category.slug} to="/dubai/$intent" params={{ intent: special.intent }} className={className}>{category.name}</Link>;
            }
            return <Link key={category.slug} to="/rent" search={{ category: category.slug }} className={className}>{category.name}</Link>;
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-3xl text-ink">Featured rentals</h2>
          <Link to="/rent" className="text-sm font-medium text-pine">See all</Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.rent.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-3xl text-ink">Cars for sale</h2>
          <Link to="/buy" className="text-sm font-medium text-pine">See all</Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.sale.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl text-ink">Why use {site.name}</h2>
          <ul className="mt-4 space-y-4">
            <Why icon={<Search className="size-5" />} title={`${data.total} cars you can open now`} body="The homepage count comes from live listings, not a slogan." />
            <Why icon={<MessageCircle className="size-5" />} title="Direct WhatsApp contact" body="Message the advertiser yourself. The marketplace does not sit in the middle of the deal." />
            <Why icon={<BadgeCheck className="size-5" />} title="Verified means an admin checked it" body="A badge is never automatic. Unbadged advertisers are still allowed to list." />
            <Why icon={<ShieldCheck className="size-5" />} title="Rent and sale in one place" body="Built for Dubai first, with emirates and areas ready for the rest of the UAE." />
          </ul>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-card p-5">
            <h3 className="text-xl font-medium text-ink">For customers</h3>
            <ol className="mt-3 space-y-2 text-sm text-ink-soft">
              <li>1. Search rentals or cars for sale.</li>
              <li>2. Compare price, location and terms.</li>
              <li>3. Contact the advertiser on WhatsApp.</li>
            </ol>
          </div>
          <div className="rounded-3xl bg-foam p-5">
            <h3 className="text-xl font-medium text-ink">For advertisers</h3>
            <ol className="mt-3 space-y-2 text-sm text-ink-soft">
              <li>1. Create an account.</li>
              <li>2. List a car for rent or sale.</li>
              <li>3. Receive customers directly.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-3xl bg-pine px-6 py-10 text-paper sm:px-10">
          <h2 className="text-4xl">Have a car to rent or sell?</h2>
          <p className="mt-2 max-w-lg text-paper/80">Create an advertiser profile and publish when you are ready. Listings can wait for review before they appear.</p>
          <Link to="/post" className="mt-6 inline-flex h-12 items-center rounded-full bg-card px-5 text-sm font-medium text-ink">Post your car</Link>
        </div>
      </section>
    </div>
  );
}

function Why({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-foam text-pine">{icon}</span>
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="text-sm text-ink-soft">{body}</p>
      </div>
    </li>
  );
}
