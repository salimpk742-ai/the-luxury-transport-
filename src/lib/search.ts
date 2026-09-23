export type ListingSearch = {
  q?: string;
  make?: string;
  model?: string;
  category?: string;
  area?: string;
  emirate?: string;
  transmission?: string;
  fuel?: string;
  body?: string;
  seller?: string;
  condition?: string;
  color?: string;
  spec?: string;
  seats?: string;
  yearMin?: string;
  yearMax?: string;
  mileageMax?: string;
  priceMin?: string;
  priceMax?: string;
  weeklyMax?: string;
  monthlyMax?: string;
  depositMax?: string;
  driver?: string;
  delivery?: string;
  sort?: "price_asc" | "price_desc" | "featured" | "relevant";
  page?: string;
};

const KEYS: (keyof ListingSearch)[] = [
  "q",
  "make",
  "model",
  "category",
  "area",
  "emirate",
  "transmission",
  "fuel",
  "body",
  "seller",
  "condition",
  "color",
  "spec",
  "seats",
  "yearMin",
  "yearMax",
  "mileageMax",
  "priceMin",
  "priceMax",
  "weeklyMax",
  "monthlyMax",
  "depositMax",
  "driver",
  "delivery",
  "sort",
  "page",
];

const SORTS = new Set(["price_asc", "price_desc", "featured", "relevant"]);
const DELIVERY = new Set(["yes", "dubai", "airport"]);

export function parseListingSearch(search: Record<string, unknown>): ListingSearch {
  const out: ListingSearch = {};
  for (const key of KEYS) {
    const raw = search[key];
    if (typeof raw !== "string") continue;
    const value = raw.trim().slice(0, 80);
    if (!value) continue;
    if (key === "sort") {
      if (SORTS.has(value)) out.sort = value as ListingSearch["sort"];
      continue;
    }
    if (key === "page") {
      const n = Number(value);
      if (Number.isFinite(n) && n > 1 && n < 80) out.page = String(Math.floor(n));
      continue;
    }
    if (key === "driver" && value !== "yes" && value !== "no") continue;
    if (key === "delivery" && !DELIVERY.has(value)) continue;
    (out as Record<string, string>)[key] = value;
  }
  return out;
}

export function searchActive(search: ListingSearch) {
  return Object.entries(search).filter(([key, value]) => key !== "sort" && key !== "page" && Boolean(value)).length;
}

/** Filter, sort, and page URLs are not landing pages. Keep them out of the index. */
export function filteredSearch(search: ListingSearch) {
  return searchActive(search) > 0 || Boolean(search.sort) || Boolean(search.page);
}
