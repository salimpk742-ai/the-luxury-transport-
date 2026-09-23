import type { Listing } from "@/lib/marketplace/types";
import type { SiteConfig } from "@/lib/site";
import { slugify } from "@/lib/text";

export function homeTitle(site: SiteConfig) {
  return site.metaTitle || `${site.name} | Car Rental & Cars for Sale in Dubai`;
}

export function homeDescription(site: SiteConfig) {
  return (
    site.metaDescription ||
    `Find cars to rent and buy in Dubai. Browse rental cars and vehicles for sale from rental companies, dealers, businesses and private sellers on ${site.name}.`
  );
}

export function titled(site: SiteConfig, page: string) {
  return `${page} | ${site.name}`;
}

export function canonical(site: SiteConfig, path: string) {
  const base = (site.url || "https://theluxurycars.com").replace(/\/$/, "").replace(/^http:\/\//i, "https://");
  const next = path.startsWith("/") ? path : `/${path}`;
  return `${base}${next === "/" ? "" : next}`;
}

export function publicHead(
  site: SiteConfig,
  input: { title: string; description: string; path: string; index?: boolean },
) {
  const description = input.description.replace(/\s+/g, " ").trim().slice(0, 180);
  return {
    meta: [
      { title: input.title },
      { name: "description", content: description },
      { name: "robots", content: input.index === false ? "noindex,follow" : "index,follow" },
    ],
    links: [{ rel: "canonical", href: canonical(site, input.path) }],
  };
}

export function noindexHead(title: string) {
  return {
    meta: [
      { title },
      { name: "robots", content: "noindex,follow" },
    ],
  };
}

export function absoluteAsset(site: SiteConfig, url: string) {
  if (!url || url.startsWith("data:")) return "";
  if (/^https:\/\//i.test(url)) return url;
  if (/^http:\/\//i.test(url)) return "";
  return canonical(site, url);
}

export function photoAlt(
  listing: Pick<Listing, "year" | "make" | "model" | "type" | "area" | "title" | "imageAlt">,
) {
  const given = listing.imageAlt?.trim() ?? "";
  if (given && !/^(image|photo|img|car image|picture)\b/i.test(given)) return given;
  const kind = listing.type === "RENT" ? "available for rental" : "for sale";
  return `${listing.year} ${listing.make} ${listing.model} ${kind} in ${listing.area}`.replace(/\s+/g, " ").trim();
}

export function listingSeo(site: SiteConfig, listing: Listing) {
  const name = [listing.year, listing.make, listing.model, listing.variant].filter(Boolean).join(" ");
  const rent = listing.type === "RENT";
  const title = titled(site, `${name} ${rent ? "Rental" : "for Sale"} in Dubai`);
  const facts = [listing.transmission, listing.fuel, listing.seats ? `${listing.seats} seats` : ""].filter(Boolean).join(", ");
  const parts = [
    rent ? `${name} for rent in ${listing.area}, Dubai.` : `${name} for sale in ${listing.area}, Dubai.`,
    facts ? `${facts}.` : "",
    rent && listing.dailyPrice ? `From AED ${listing.dailyPrice} a day.` : "",
    !rent && listing.salePrice ? `Listed at AED ${listing.salePrice}.` : "",
    listing.mileage ? `${listing.mileage.toLocaleString("en-AE")} km.` : "",
    rent ? "Ask the advertiser about availability and rental terms." : "Ask the seller if this vehicle is available.",
  ];
  const path = `/${rent ? "rent" : "buy"}/${listing.slugVehicle}/${listing.slugArea}/${listing.id}`;
  return {
    title,
    description: parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim(),
    path,
    index: !listing.isDemo,
  };
}

function crumbList(items: { name: string; item?: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      ...(entry.item ? { item: entry.item } : {}),
    })),
  };
}

export function organizationGraph(site: SiteConfig) {
  const sameAs = [site.instagram, site.facebook, site.x, site.tiktok, site.youtube, site.linkedin].filter(Boolean);
  const org: Record<string, unknown> = {
    "@type": "Organization",
    name: site.name,
    url: canonical(site, "/"),
    email: site.email,
    description: site.description,
    areaServed: site.market || "Dubai, United Arab Emirates",
  };
  const logo = absoluteAsset(site, site.logoUrl);
  if (logo) org.logo = logo;
  if (site.phone) org.telephone = site.phone;
  if (sameAs.length) org.sameAs = sameAs;
  const website: Record<string, unknown> = {
    "@type": "WebSite",
    name: site.name,
    url: canonical(site, "/"),
    description: site.description,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: site.name, url: canonical(site, "/") },
  };
  return { "@context": "https://schema.org", "@graph": [org, website] };
}

export function listingGraph(site: SiteConfig, listing: Listing) {
  const rent = listing.type === "RENT";
  const root = rent ? "/rent" : "/buy";
  const makePath = `${root}/${slugify(listing.make)}`;
  const path = `${root}/${listing.slugVehicle}/${listing.slugArea}/${listing.id}`;
  const crumbs = crumbList([
    { name: "Home", item: canonical(site, "/") },
    { name: rent ? "Rent" : "Buy", item: canonical(site, root) },
    { name: listing.make, item: canonical(site, makePath) },
    { name: listing.title, item: canonical(site, path) },
  ]);
  if (listing.isDemo) {
    return { "@context": "https://schema.org", "@graph": [crumbs] };
  }
  const image = absoluteAsset(site, listing.imageUrl);
  const vehicle: Record<string, unknown> = {
    "@type": "Car",
    name: listing.title,
    brand: { "@type": "Brand", name: listing.make },
    model: listing.model,
    vehicleModelDate: String(listing.year),
    description: listing.description,
    url: canonical(site, path),
  };
  if (listing.fuel) vehicle.fuelType = listing.fuel;
  if (listing.transmission) vehicle.vehicleTransmission = listing.transmission;
  if (listing.color) vehicle.color = listing.color;
  if (listing.seats) vehicle.vehicleSeatingCapacity = listing.seats;
  if (listing.bodyType) vehicle.bodyType = listing.bodyType;
  if (image) vehicle.image = image;
  if (listing.mileage > 0) {
    vehicle.mileageFromOdometer = { "@type": "QuantitativeValue", value: listing.mileage, unitCode: "KMT" };
  }
  const price = rent ? listing.dailyPrice : listing.salePrice;
  if (price && price > 0) {
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      priceCurrency: "AED",
      price: String(price),
      url: canonical(site, path),
      availability: "https://schema.org/InStock",
      businessFunction: rent ? "https://schema.org/LeaseOut" : "https://schema.org/Sell",
      seller: {
        "@type": listing.sellerType === "Private Seller" ? "Person" : "Organization",
        name: listing.companyName,
      },
    };
    if (rent) {
      offer.priceSpecification = {
        "@type": "UnitPriceSpecification",
        price: String(price),
        priceCurrency: "AED",
        unitText: "DAY",
      };
    } else {
      offer.itemCondition = listing.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition";
    }
    vehicle.offers = offer;
  }
  return { "@context": "https://schema.org", "@graph": [vehicle, crumbs] };
}

export function breadcrumbGraph(items: { name: string; item?: string }[]) {
  return { "@context": "https://schema.org", ...crumbList(items) };
}
