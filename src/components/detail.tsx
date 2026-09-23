import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Heart, Phone, Share2 } from "lucide-react";
import { aed, deliverySummary, inquiryMessage, km, telHref } from "@/lib/format";
import { trackPublic } from "@/lib/marketplace/fns";
import type { Listing, ListingDetail } from "@/lib/marketplace/types";
import { listingGraph, photoAlt } from "@/lib/seo";
import { slugify } from "@/lib/text";
import { useShell } from "@/components/shell";
import { ListingCard } from "@/components/listing-card";
import { useRouteContext } from "@tanstack/react-router";
import { cn } from "@/lib/cn";

export function DetailView({ listing, similar }: { listing: ListingDetail; similar: Listing[] }) {
  const { site } = useRouteContext({ from: "__root__" });
  const shell = useShell();
  const [photo, setPhoto] = useState(0);
  const images = listing.images.length ? listing.images : [{ id: 0, url: listing.imageUrl, alt: listing.imageAlt, sortOrder: 0, isPrimary: true }];
  const current = images[photo] ?? images[0];
  const saved = shell.saved.includes(listing.id);
  const touchX = useRef(0);

  useEffect(() => {
    const key = `marq-view-${listing.id}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    void trackPublic({ data: { event: "listing_view", listingId: listing.id, meta: { type: listing.type } } });
  }, [listing.id, listing.type]);

  const specs = [
    ["Make", listing.make],
    ["Model", listing.model],
    ["Variant", listing.variant || "—"],
    ["Year", String(listing.year)],
    ["Mileage", km(listing.mileage)],
    ["Transmission", listing.transmission],
    ["Fuel", listing.fuel],
    ["Engine", listing.engine || "—"],
    ["Seats", String(listing.seats)],
    ["Body", listing.bodyType],
    ["Colour", listing.color || "—"],
    ["Specification", listing.regionalSpec],
    ["Location", `${listing.area}, ${listing.emirate}`],
  ];

  const call = () => {
    if (listing.isDemo || !listing.phone) return;
    void trackPublic({ data: { event: "phone_click", listingId: listing.id, meta: { type: listing.type } } });
    window.location.href = telHref(listing.phone);
  };

  const share = async () => {
    const url = window.location.href;
    const payload = { title: listing.title, text: inquiryMessage(site.name, listing), url };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard.writeText(url);
  };

  const root = listing.type === "RENT" ? "/rent" : "/buy";
  const makeTo = listing.type === "RENT" ? "/rent/$vehicle" : "/buy/$vehicle";
  return (
    <article className="mx-auto max-w-6xl px-4 py-6 pb-28">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span> / </span>
        <Link to={root} className="hover:text-ink">{listing.type === "RENT" ? "Rent" : "Buy"}</Link>
        <span> / </span>
        <Link to={makeTo} params={{ vehicle: slugify(listing.make) }} className="hover:text-ink">{listing.make}</Link>
        <span> / </span>
        <span className="text-ink">{listing.title}</span>
      </nav>
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <div>
          <div className="overflow-hidden rounded-3xl bg-sand">
            {current?.url ? (
              <img
                src={current.url}
                alt={current.alt || photoAlt(listing)}
                width={1280}
                height={853}
                fetchPriority="high"
                decoding="async"
                className="aspect-photo w-full object-cover"
                onTouchStart={(event) => { touchX.current = event.changedTouches[0]?.clientX ?? 0; }}
                onTouchEnd={(event) => {
                  const dx = (event.changedTouches[0]?.clientX ?? 0) - touchX.current;
                  if (dx > 40) setPhoto((index) => Math.max(0, index - 1));
                  if (dx < -40) setPhoto((index) => Math.min(images.length - 1, index + 1));
                }}
              />
            ) : null}
          </div>
          {images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-auto">
              {images.map((image, index) => (
                <button key={image.id} type="button" onClick={() => setPhoto(index)} className={cn("h-16 w-24 shrink-0 overflow-hidden rounded-2xl border", index === photo ? "border-pine" : "border-line")} aria-label={`Photo ${index + 1}`}>
                  <img src={image.url} alt={image.alt || `${photoAlt(listing)} photo ${index + 1}`} width={160} height={106} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
          <header className="mt-6">
            <div className="flex flex-wrap gap-2">
              {listing.isFeatured ? <span className="rounded-full bg-pine px-2.5 py-1 text-xs font-medium text-paper">Featured</span> : null}
              {listing.isDemo ? <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-ink">Sample</span> : null}
            </div>
            <h1 className="mt-3 text-4xl text-ink sm:text-5xl">{listing.title}</h1>
            <p className="mt-2 text-ink-soft">{listing.area}, {listing.emirate}</p>
          </header>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specs.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-line bg-card p-3">
                <dt className="text-xs uppercase tracking-widest text-muted">{label}</dt>
                <dd className="mt-1 text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <section className="mt-8">
            <h2 className="text-3xl text-ink">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-ink-soft">{listing.description}</p>
          </section>
          {listing.type === "RENT" ? (
            <section className="mt-8">
              <h2 className="text-3xl text-ink">Rental terms</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <Term label="Minimum period" value={listing.minPeriod} />
                <Term label="Mileage allowance" value={listing.mileageAllowance} />
                <Term label="Extra mileage" value={listing.extraMileagePrice} />
                <Term label="Deposit" value={listing.deposit != null ? aed(listing.deposit) : ""} />
                <Term label="Insurance" value={listing.insurance} />
                <Term label="Driver" value={listing.withDriver ? "With driver available" : "Self-drive"} />
                <Term label="Requirements" value={listing.driverRequirements} />
                <Term label="Pickup" value={listing.pickupLocation} />
                <Term label="Delivery" value={listing.deliveryAvailable ? deliverySummary(listing) : "Not offered by this advertiser"} />
              </dl>
            </section>
          ) : (
            <section className="mt-8">
              <h2 className="text-3xl text-ink">Seller notes</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <Term label="Condition" value={listing.condition === "new" ? "New" : "Used"} />
                <Term label="Accidents" value={listing.accidentHistory} />
                <Term label="Service" value={listing.serviceHistory} />
                <Term label="Warranty" value={listing.warranty} />
                <Term label="Registration" value={listing.registrationStatus} />
              </dl>
            </section>
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-3xl border border-line bg-card p-5">
            {listing.type === "RENT" ? (
              <div className="space-y-1">
                <p className="text-3xl tabular-nums text-ink">{listing.dailyPrice != null ? aed(listing.dailyPrice) : "Ask"} <span className="text-base text-muted">/ day</span></p>
                <p className="text-sm tabular-nums text-ink-soft">
                  {listing.weeklyPrice != null ? `${aed(listing.weeklyPrice)} / week` : null}
                  {listing.monthlyPrice != null ? ` · ${aed(listing.monthlyPrice)} / month` : null}
                </p>
                {listing.deposit != null ? <p className="text-sm text-muted">Deposit {aed(listing.deposit)}</p> : null}
              </div>
            ) : (
              <p className="text-3xl tabular-nums text-ink">{aed(listing.salePrice)}</p>
            )}
            <button type="button" onClick={() => shell.contact(listing)} className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-whatsapp text-sm font-medium text-paper">
              WhatsApp seller
            </button>
            {!listing.isDemo && listing.phone ? (
              <button type="button" onClick={call} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line text-sm font-medium">
                <Phone className="size-4" aria-hidden="true" /> Call
              </button>
            ) : null}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => shell.toggleSave(listing.id)} className="flex h-11 items-center justify-center gap-2 rounded-full border border-line text-sm">
                <Heart className={cn("size-4", saved && "fill-pine text-pine")} /> {saved ? "Saved" : "Save"}
              </button>
              <button type="button" onClick={() => void share()} className="flex h-11 items-center justify-center gap-2 rounded-full border border-line text-sm">
                <Share2 className="size-4" /> Share
              </button>
            </div>
            <p className="mt-3 text-xs text-muted">WhatsApp and calls go to the advertiser, not to {site.name}.</p>
            <Link to="/report-listing" search={listing.id ? { listing: String(listing.id) } : {}} className="mt-3 block text-center text-sm text-muted underline">
              Report listing
            </Link>
          </div>
          <div className="rounded-3xl border border-line bg-card p-5">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl text-ink">{listing.companyName}</h2>
              {listing.companyVerified && !listing.isDemo ? <BadgeCheck className="size-5 text-pine" aria-label="Verified business" /> : null}
            </div>
            <p className="mt-1 text-sm text-muted">{listing.sellerType} · {listing.companyArea || listing.area}</p>
            {listing.isDemo ? (
              <p className="mt-3 text-sm text-ink-soft">Sample profile. A verified badge on a sample advertiser is only a preview of the badge. It is not a trade-licence check.</p>
            ) : (
              <p className="mt-3 text-sm text-ink-soft">{listing.companyDescription}</p>
            )}
            <Link to="/dealer/$slug" params={{ slug: listing.companySlug }} className="mt-4 inline-flex h-11 items-center text-sm font-medium text-pine">
              View all listings
            </Link>
          </div>
        </aside>
      </div>
      {similar.length ? (
        <section className="mt-12">
          <h2 className="text-3xl text-ink">Similar cars</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      ) : null}
      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-line bg-card p-3 lg:hidden">
        <button type="button" onClick={() => shell.contact(listing)} className="flex h-12 w-full items-center justify-center rounded-full bg-whatsapp text-sm font-medium text-paper">
          WhatsApp seller
        </button>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingGraph(site, listing)) }}
      />
    </article>
  );
}

function Term({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl bg-card p-3">
      <dt className="text-xs uppercase tracking-widest text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}
