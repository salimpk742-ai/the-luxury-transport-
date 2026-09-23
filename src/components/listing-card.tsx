import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { aed, km } from "@/lib/format";
import type { Listing } from "@/lib/marketplace/types";
import { cn } from "@/lib/cn";
import { photoAlt } from "@/lib/seo";
import { useShell } from "@/components/shell";

function CarLink({ listing, className, children }: { listing: Listing; className?: string; children: ReactNode }) {
  const params = { vehicle: listing.slugVehicle, area: listing.slugArea, id: String(listing.id) };
  if (listing.type === "SALE") {
    return (
      <Link to="/buy/$vehicle/$area/$id" params={params} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/rent/$vehicle/$area/$id" params={params} className={className}>
      {children}
    </Link>
  );
}

export function ListingCard({ listing }: { listing: Listing }) {
  const shell = useShell();
  const saved = shell.saved.includes(listing.id);
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-card">
      <div className="relative">
        <CarLink listing={listing} className="block aspect-photo overflow-hidden bg-sand">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={photoAlt(listing)}
              width={1280}
              height={853}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
            />
          ) : null}
        </CarLink>
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {listing.isFeatured ? <span className="rounded-full bg-pine px-2.5 py-1 text-xs font-medium text-paper">Featured</span> : null}
          {listing.companyVerified && !listing.isDemo ? (
            <span className="rounded-full bg-card px-2.5 py-1 text-xs font-medium text-pine">Verified</span>
          ) : null}
          {listing.isDemo ? <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-ink">Sample</span> : null}
        </div>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Remove saved car" : "Save car"}
          onClick={() => shell.toggleSave(listing.id)}
          className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-card text-ink"
        >
          <Heart className={cn("size-5", saved && "fill-pine text-pine")} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <CarLink listing={listing} className="text-base font-medium text-ink">
          {listing.title}
        </CarLink>
        <p className="text-sm text-muted">
          {listing.type === "RENT"
            ? `${listing.year} · ${listing.transmission} · ${listing.fuel} · ${listing.seats} seats`
            : `${listing.year} · ${km(listing.mileage)} · ${listing.transmission}`}
        </p>
        {listing.type === "RENT" ? (
          <div>
            {listing.dailyPrice != null ? (
              <p className="text-lg font-medium tabular-nums text-ink">
                {aed(listing.dailyPrice)}
                <span className="text-sm font-normal text-muted"> / day</span>
              </p>
            ) : (
              <p className="text-lg font-medium text-ink">Price on request</p>
            )}
            <p className="text-sm tabular-nums text-ink-soft">
              {listing.weeklyPrice != null ? `${aed(listing.weeklyPrice)} / week` : null}
              {listing.weeklyPrice != null && listing.monthlyPrice != null ? " · " : null}
              {listing.monthlyPrice != null ? `${aed(listing.monthlyPrice)} / month` : null}
            </p>
            {listing.deposit != null ? <p className="text-xs text-muted">Deposit {aed(listing.deposit)}</p> : null}
          </div>
        ) : (
          <p className="text-lg font-medium tabular-nums text-ink">{aed(listing.salePrice)}</p>
        )}
        <p className="text-sm text-ink-soft">{listing.area}</p>
        <div className="mt-auto pt-2">
          <button
            type="button"
            onClick={() => shell.contact(listing)}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-whatsapp text-sm font-medium text-paper"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
}
