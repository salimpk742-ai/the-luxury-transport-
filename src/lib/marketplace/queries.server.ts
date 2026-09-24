import { getSql, type Sql } from "@/lib/db";
import { sellerTypeFor } from "@/lib/format";
import { googleSiteVerification, normalizeSite, type SiteConfig } from "@/lib/site";
import type { ListingSearch } from "@/lib/search";
import { cleanText, digits, slugify } from "@/lib/text";
import type {
  Category,
  CompanyPublic,
  Facets,
  HomePayload,
  Listing,
  ListingDetail,
  ListingDraft,
  ListingImage,
  OwnedCompany,
  Place,
  Profile,
  SearchResult,
} from "@/lib/marketplace/types";

const LISTING_SELECT = `
  select
    l.id,
    l.type,
    l.status,
    l.title,
    l.slug_vehicle as "slugVehicle",
    l.slug_area as "slugArea",
    l.make,
    l.model,
    l.variant,
    l.year,
    l.body_type as "bodyType",
    l.category,
    coalesce(cat.name, l.category) as "categoryName",
    l.transmission,
    l.fuel,
    l.engine,
    l.seats,
    l.color,
    l.mileage,
    l.regional_spec as "regionalSpec",
    l.emirate,
    l.area,
    l.pickup_location as "pickupLocation",
    l.description,
    l.whatsapp,
    l.phone,
    l.preferred_contact as "preferredContact",
    l.is_featured as "isFeatured",
    l.promotion_tier as "promotionTier",
    l.views,
    l.whatsapp_leads as "whatsappLeads",
    l.phone_leads as "phoneLeads",
    l.with_driver as "withDriver",
    l.availability,
    l.condition,
    l.seller_type as "sellerType",
    l.published_at::text as "publishedAt",
    l.expires_at::text as "expiresAt",
    l.created_at::text as "createdAt",
    l.company_id as "companyId",
    c.slug as "companySlug",
    c.name as "companyName",
    c.verified as "companyVerified",
    c.logo_url as "companyLogo",
    c.description as "companyDescription",
    c.area as "companyArea",
    c.emirate as "companyEmirate",
    c.plan as "companyPlan",
    c.website as "companyWebsite",
    c.is_demo as "isDemo",
    r.daily_price as "dailyPrice",
    r.weekly_price as "weeklyPrice",
    r.monthly_price as "monthlyPrice",
    r.deposit,
    coalesce(r.min_period, '') as "minPeriod",
    coalesce(r.mileage_allowance, '') as "mileageAllowance",
    coalesce(r.extra_mileage_price, '') as "extraMileagePrice",
    coalesce(r.insurance, '') as "insurance",
    coalesce(r.driver_requirements, '') as "driverRequirements",
    coalesce(r.delivery, '') as "delivery",
    coalesce(r.delivery_available, false) as "deliveryAvailable",
    coalesce(r.delivery_scope, '') as "deliveryScope",
    coalesce(r.delivery_areas, '') as "deliveryAreas",
    coalesce(r.delivery_fee, '') as "deliveryFee",
    coalesce(r.airport_delivery, false) as "airportDelivery",
    s.price as "salePrice",
    coalesce(s.accident_history, '') as "accidentHistory",
    coalesce(s.service_history, '') as "serviceHistory",
    coalesce(s.warranty, '') as "warranty",
    coalesce(s.registration_status, '') as "registrationStatus",
    coalesce((select vi.url from vehicle_images vi where vi.listing_id = l.id order by vi.is_primary desc, vi.sort_order asc, vi.id asc limit 1), '') as "imageUrl",
    coalesce((select vi.alt from vehicle_images vi where vi.listing_id = l.id order by vi.is_primary desc, vi.sort_order asc, vi.id asc limit 1), l.title) as "imageAlt"
  from listings l
  join companies c on c.id = l.company_id
  left join categories cat on cat.slug = l.category
  left join rental_details r on r.listing_id = l.id
  left join sale_details s on s.listing_id = l.id
`;

const PUBLIC_WHERE = `l.status = 'PUBLISHED' and c.suspended = false and (l.expires_at is null or l.expires_at > now())`;

type Scope = {
  type?: "RENT" | "SALE";
  category?: string;
  make?: string;
  model?: string;
  condition?: string;
  area?: string;
  emirate?: string;
};

const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const prev = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (prev.length >= limit) return false;
  prev.push(now);
  buckets.set(key, prev);
  return true;
}

function asListing(row: Listing): Listing {
  return {
    ...row,
    year: Number(row.year),
    seats: Number(row.seats),
    mileage: Number(row.mileage),
    views: Number(row.views),
    whatsappLeads: Number(row.whatsappLeads),
    phoneLeads: Number(row.phoneLeads),
    companyId: Number(row.companyId),
    dailyPrice: row.dailyPrice == null ? null : Number(row.dailyPrice),
    weeklyPrice: row.weeklyPrice == null ? null : Number(row.weeklyPrice),
    monthlyPrice: row.monthlyPrice == null ? null : Number(row.monthlyPrice),
    deposit: row.deposit == null ? null : Number(row.deposit),
    salePrice: row.salePrice == null ? null : Number(row.salePrice),
    isFeatured: Boolean(row.isFeatured),
    withDriver: Boolean(row.withDriver),
    companyVerified: Boolean(row.companyVerified),
    isDemo: Boolean(row.isDemo),
    deliveryAvailable: Boolean(row.deliveryAvailable),
    airportDelivery: Boolean(row.airportDelivery),
    type: row.type === "SALE" ? "SALE" : "RENT",
  };
}

function orderSql(sort?: string) {
  if (sort === "price_asc") return "coalesce(s.price, r.daily_price) asc nulls last, l.id desc";
  if (sort === "price_desc") return "coalesce(s.price, r.daily_price) desc nulls last, l.id desc";
  if (sort === "relevant") return "l.is_featured desc, l.views desc, l.published_at desc nulls last, l.id desc";
  if (sort === "featured") return "l.is_featured desc, l.published_at desc nulls last, l.id desc";
  return "l.published_at desc nulls last, l.id desc";
}

function intOf(value?: string, max = 100_000_000) {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > max) return undefined;
  return Math.round(n);
}

export async function readSite(): Promise<SiteConfig> {
  const sql = await getSql();
  const rows = await sql<{ value: unknown }>`select value from site_settings where key = 'identity'`;
  const site = normalizeSite(rows[0]?.value);
  if (!site.googleVerification) {
    site.googleVerification = googleSiteVerification(process.env.GOOGLE_SITE_VERIFICATION);
  }
  return site;
}

export async function searchListings(
  input: ListingSearch & { type?: "RENT" | "SALE"; limit?: number; facets?: boolean },
  scope: Scope = {},
): Promise<SearchResult> {
  const sql = await getSql();
  const where = [PUBLIC_WHERE];
  const params: unknown[] = [];
  const add = (clause: (n: number) => string, value: unknown) => {
    params.push(value);
    where.push(clause(params.length));
  };

  const type = input.type ?? scope.type;
  if (type === "RENT" || type === "SALE") add((n) => `l.type = $${n}`, type);
  const category = scope.category || input.category;
  const make = scope.make || input.make;
  const condition = scope.condition || input.condition;
  const area = scope.area || input.area;
  const emirate = scope.emirate || input.emirate;
  if (category) add((n) => `l.category = $${n}`, category);
  if (make) add((n) => `l.make = $${n}`, make);
  if (condition === "new" || condition === "used") add((n) => `l.condition = $${n}`, condition);
  if (area) {
    params.push(area);
    const n = params.length;
    where.push(`(
      l.area_slug = $${n}
      or l.area_slug in (select slug from locations where parent_slug = $${n} and active = true)
      or exists (
        select 1 from locations loc
        where loc.slug = $${n} and loc.scope = 'emirate' and loc.active = true and loc.emirate = l.emirate
      )
    )`);
  }
  if (emirate) add((n) => `l.emirate = $${n}`, emirate);
  if (scope.model) add((n) => `l.model = $${n}`, scope.model);
  else if (input.model) add((n) => `l.model ilike $${n}`, `%${input.model.replace(/[\\%_]/g, "")}%`);
  if (input.q) {
    const q = `%${input.q.replace(/[\\%_]/g, "")}%`;
    params.push(q);
    const n = params.length;
    where.push(
      `(l.title ilike $${n} or l.make ilike $${n} or l.model ilike $${n} or l.variant ilike $${n} or l.area ilike $${n} or c.name ilike $${n})`,
    );
  }
  if (input.transmission) add((n) => `l.transmission = $${n}`, input.transmission);
  if (input.fuel) add((n) => `l.fuel = $${n}`, input.fuel);
  if (input.body) add((n) => `l.body_type = $${n}`, input.body);
  if (input.seller) add((n) => `l.seller_type = $${n}`, input.seller);
  if (input.color) add((n) => `l.color ilike $${n}`, `%${input.color.replace(/[\\%_]/g, "")}%`);
  if (input.spec) add((n) => `l.regional_spec = $${n}`, input.spec);
  const seats = intOf(input.seats, 15);
  if (seats) add((n) => `l.seats >= $${n}`, seats);
  const yearMin = intOf(input.yearMin, 2100);
  const yearMax = intOf(input.yearMax, 2100);
  const mileageMax = intOf(input.mileageMax, 2_000_000);
  if (yearMin) add((n) => `l.year >= $${n}`, yearMin);
  if (yearMax) add((n) => `l.year <= $${n}`, yearMax);
  if (mileageMax) add((n) => `l.mileage <= $${n}`, mileageMax);
  const priceMin = intOf(input.priceMin);
  const priceMax = intOf(input.priceMax);
  const priceCol = type === "SALE" ? "s.price" : "r.daily_price";
  if (priceMin != null && type) add((n) => `${priceCol} >= $${n}`, priceMin);
  if (priceMax != null && type) add((n) => `${priceCol} <= $${n}`, priceMax);
  const weeklyMax = intOf(input.weeklyMax);
  const monthlyMax = intOf(input.monthlyMax);
  const depositMax = intOf(input.depositMax);
  if (weeklyMax != null) add((n) => `r.weekly_price <= $${n}`, weeklyMax);
  if (monthlyMax != null) add((n) => `r.monthly_price <= $${n}`, monthlyMax);
  if (depositMax != null) add((n) => `r.deposit <= $${n}`, depositMax);
  if (input.driver === "yes") where.push("l.with_driver = true");
  if (input.driver === "no") where.push("l.with_driver = false");
  if (input.delivery === "yes") where.push("r.delivery_available = true");
  if (input.delivery === "dubai") where.push("r.delivery_available = true and r.delivery_scope = 'dubai'");
  if (input.delivery === "airport") where.push("r.delivery_available = true and r.airport_delivery = true");

  const whereSql = where.join(" and ");
  const countRows = await sql.query<{ n: number }>(
    `select count(*)::int as n ${LISTING_SELECT.slice(LISTING_SELECT.indexOf("from listings"))} where ${whereSql}`,
    params,
  );
  const total = Number(countRows[0]?.n ?? 0);
  const limit = Math.min(24, Math.max(1, input.limit ?? 12));
  const page = Math.min(60, Math.max(1, intOf(input.page, 80) ?? 1));
  const offset = (page - 1) * limit;
  const rows = await sql.query<Listing>(
    `${LISTING_SELECT} where ${whereSql} order by ${orderSql(input.sort)} limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, limit, offset],
  );

  const facetWhere = [PUBLIC_WHERE];
  const facetParams: unknown[] = [];
  const emptyFacets: Facets = { makes: [], categories: [], areas: [], fuels: [], transmissions: [] };
  let facets: Facets = emptyFacets;
  if (input.facets !== false) {
  const pushScope = (clause: string, value: unknown) => {
    facetParams.push(value);
    facetWhere.push(clause.replace("?", `$${facetParams.length}`));
  };
  if (type === "RENT" || type === "SALE") pushScope("l.type = ?", type);
  if (scope.category) pushScope("l.category = ?", scope.category);
  if (scope.make) pushScope("l.make = ?", scope.make);
  if (scope.area) pushScope("l.area_slug = ?", scope.area);
  if (scope.emirate) pushScope("l.emirate = ?", scope.emirate);
  if (scope.condition === "new" || scope.condition === "used") pushScope("l.condition = ?", scope.condition);
  const fw = facetWhere.join(" and ");
  const [makes, categories, areas, fuels, transmissions] = await Promise.all([
    sql.query<{ name: string; n: number }>(
      `select l.make as name, count(*)::int as n from listings l join companies c on c.id = l.company_id where ${fw} group by l.make order by n desc, l.make`,
      facetParams,
    ),
    sql.query<{ name: string; n: number; slug: string }>(
      `select coalesce(cat.name, l.category) as name, l.category as slug, count(*)::int as n from listings l join companies c on c.id = l.company_id left join categories cat on cat.slug = l.category where ${fw} group by l.category, cat.name order by n desc`,
      facetParams,
    ),
    sql.query<{ name: string; n: number; slug: string }>(
      `select l.area as name, l.area_slug as slug, count(*)::int as n from listings l join companies c on c.id = l.company_id where ${fw} group by l.area, l.area_slug order by n desc, l.area`,
      facetParams,
    ),
    sql.query<{ name: string; n: number }>(
      `select l.fuel as name, count(*)::int as n from listings l join companies c on c.id = l.company_id where ${fw} group by l.fuel order by n desc`,
      facetParams,
    ),
    sql.query<{ name: string; n: number }>(
      `select l.transmission as name, count(*)::int as n from listings l join companies c on c.id = l.company_id where ${fw} group by l.transmission order by n desc`,
      facetParams,
    ),
  ]);

  facets = { makes, categories, areas, fuels, transmissions };
  }
  return {
    items: rows.map(asListing),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    facets,
  };
}

async function imagesFor(sql: Sql, listingId: number): Promise<ListingImage[]> {
  const rows = await sql.query<ListingImage>(
    `select id, url, alt, sort_order as "sortOrder", is_primary as "isPrimary" from vehicle_images where listing_id = $1 order by is_primary desc, sort_order asc, id asc`,
    [listingId],
  );
  return rows.map((row) => ({ ...row, id: Number(row.id), sortOrder: Number(row.sortOrder), isPrimary: Boolean(row.isPrimary) }));
}

export async function getPublicListing(id: number): Promise<{ listing: ListingDetail; similar: Listing[] } | null> {
  if (!Number.isFinite(id)) return null;
  const sql = await getSql();
  const rows = await sql.query<Listing>(`${LISTING_SELECT} where l.id = $1 and ${PUBLIC_WHERE}`, [id]);
  const listing = rows[0];
  if (!listing) return null;
  const mapped = asListing(listing);
  const [images, similarRows] = await Promise.all([
    imagesFor(sql, id),
    sql.query<Listing>(
      `${LISTING_SELECT} where ${PUBLIC_WHERE} and l.id <> $1 and l.type = $2 and (l.category = $3 or l.make = $4) order by l.is_featured desc, l.published_at desc limit 3`,
      [id, mapped.type, mapped.category, mapped.make],
    ),
  ]);
  return { listing: { ...mapped, images }, similar: similarRows.map(asListing) };
}

export async function getHome(): Promise<HomePayload> {
  const [rent, sale, places, categories, counts] = await Promise.all([
    searchListings({ type: "RENT", sort: "featured", limit: 4, facets: false }),
    searchListings({ type: "SALE", sort: "featured", limit: 4, facets: false }),
    listPlaces(),
    listCategories(),
    countLive(),
  ]);
  return {
    rent: rent.items,
    sale: sale.items,
    places,
    categories,
    total: counts.total,
    rentCount: counts.rent,
    saleCount: counts.sale,
  };
}

async function countLive() {
  const sql = await getSql();
  const rows = await sql<{ rent: number; sale: number; total: number }>`
    select
      coalesce(sum(case when l.type = 'RENT' then 1 else 0 end), 0)::int as rent,
      coalesce(sum(case when l.type = 'SALE' then 1 else 0 end), 0)::int as sale,
      count(*)::int as total
    from listings l
    join companies c on c.id = l.company_id
    where l.status = 'PUBLISHED' and c.suspended = false and (l.expires_at is null or l.expires_at > now())
  `;
  return {
    rent: Number(rows[0]?.rent ?? 0),
    sale: Number(rows[0]?.sale ?? 0),
    total: Number(rows[0]?.total ?? 0),
  };
}

export async function listPlaces(includeInactive = false): Promise<Place[]> {
  const sql = await getSql();
  const rows = await sql.query<Place>(
    `select id, emirate, area, slug, scope, popular, sort_order as "sortOrder",
      coalesce(parent_slug, '') as "parentSlug", coalesce(active, true) as active
     from locations
     where ($1::boolean or active = true)
     order by sort_order, emirate, area`,
    [includeInactive],
  );
  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    sortOrder: Number(row.sortOrder),
    popular: Boolean(row.popular),
    active: Boolean(row.active),
    parentSlug: row.parentSlug || "",
    scope: row.scope === "emirate" ? "emirate" : "area",
  }));
}

export async function listCategories(): Promise<Category[]> {
  const sql = await getSql();
  const rows = await sql<Category>`
    select id, slug, name, kind, sort_order as "sortOrder" from categories order by sort_order, name
  `;
  return rows.map((row) => ({ ...row, id: Number(row.id), sortOrder: Number(row.sortOrder) }));
}

export async function getPlace(slug: string) {
  const sql = await getSql();
  const rows = await sql<Place>`
    select id, emirate, area, slug, scope, popular, sort_order as "sortOrder",
      coalesce(parent_slug, '') as "parentSlug", coalesce(active, true) as active
    from locations where slug = ${slug} and active = true
  `;
  const row = rows[0];
  if (!row) return null;
  return { ...row, id: Number(row.id), sortOrder: Number(row.sortOrder), popular: Boolean(row.popular), scope: row.scope === "emirate" ? "emirate" as const : "area" as const };
}

export async function getCompanyPublic(slug: string) {
  const sql = await getSql();
  const rows = await sql<CompanyPublic>`
    select id, slug, name, salesperson_name as "salespersonName", account_type as "accountType",
      description, logo_url as "logoUrl", phone, whatsapp, website, address, emirate, area,
      verified, plan, is_demo as "isDemo", verification_note as "verificationNote"
    from companies where slug = ${slug} and suspended = false
  `;
  const company = rows[0];
  if (!company) return null;
  const mapped: CompanyPublic = {
    ...company,
    id: Number(company.id),
    verified: Boolean(company.verified),
    isDemo: Boolean(company.isDemo),
  };
  const listings = await sql.query<Listing>(
    `${LISTING_SELECT} where c.id = $1 and ${PUBLIC_WHERE} order by l.type, l.is_featured desc, l.published_at desc`,
    [mapped.id],
  );
  return { company: mapped, listings: listings.map(asListing) };
}

export async function trackEvent(
  event: string,
  listingId: number | null,
  userId: string | null,
  meta: Record<string, string>,
) {
  const allowed = ["search", "listing_view", "whatsapp_click", "phone_click", "save_listing", "post_listing", "publish_listing", "registration", "login"];
  if (!allowed.includes(event)) return;
  const sql = await getSql();
  await sql`insert into analytics_events (event, listing_id, user_id, meta) values (${event}, ${listingId}, ${userId}, ${JSON.stringify(meta)}::jsonb)`;
  if (listingId && event === "whatsapp_click") {
    await sql`update listings set whatsapp_leads = whatsapp_leads + 1 where id = ${listingId}`;
  }
  if (listingId && event === "phone_click") {
    await sql`update listings set phone_leads = phone_leads + 1 where id = ${listingId}`;
  }
  if (listingId && event === "listing_view") {
    await sql`update listings set views = views + 1 where id = ${listingId}`;
  }
}

export async function ensureProfile(userId: string, name: string, email: string): Promise<Profile> {
  const sql = await getSql();
  const existing = await sql<{ user_id: string }>`select user_id from profiles where user_id = ${userId}`;
  if (!existing[0]) {
    const admins = await sql<{ n: number }>`select count(*)::int as n from profiles where role in ('admin', 'super_admin')`;
    const role = Number(admins[0]?.n ?? 0) === 0 ? "super_admin" : "user";
    await sql`
      insert into profiles (user_id, full_name, email, role, email_verified)
      values (${userId}, ${cleanText(name, 80)}, ${cleanText(email, 120)}, ${role}, ${Boolean(email)})
    `;
  }
  return loadProfile(userId);
}

async function loadProfile(userId: string): Promise<Profile> {
  const sql = await getSql();
  const rows = await sql<{
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    whatsapp: string;
    role: string;
    accountType: string;
    suspended: boolean;
  }>`
    select user_id as "userId", full_name as "fullName", email, phone, whatsapp, role,
      account_type as "accountType", suspended
    from profiles where user_id = ${userId}
  `;
  const profile = rows[0];
  if (!profile) throw new Error("Profile missing");
  const companies = await sql<OwnedCompany>`
    select id, slug, name, salesperson_name as "salespersonName", account_type as "accountType",
      description, logo_url as "logoUrl", phone, whatsapp, email, website, address, emirate, area,
      verified, plan, is_demo as "isDemo", verification_note as "verificationNote",
      social_instagram as "socialInstagram"
    from companies where user_id = ${userId} order by id asc limit 1
  `;
  const company = companies[0]
    ? {
        ...companies[0],
        id: Number(companies[0].id),
        verified: Boolean(companies[0].verified),
        isDemo: Boolean(companies[0].isDemo),
      }
    : null;
  return { ...profile, suspended: Boolean(profile.suspended), company };
}

export async function getProfile(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ user_id: string }>`select user_id from profiles where user_id = ${userId}`;
  if (!rows[0]) return null;
  return loadProfile(userId);
}

async function requireStaff(userId: string) {
  const profile = await getProfile(userId);
  if (!profile || profile.suspended || (profile.role !== "admin" && profile.role !== "super_admin")) {
    throw new Error("Forbidden");
  }
  return profile;
}

export async function myListings(userId: string) {
  const sql = await getSql();
  const rows = await sql.query<Listing>(
    `${LISTING_SELECT} where l.user_id = $1 order by l.updated_at desc`,
    [userId],
  );
  return rows.map(asListing);
}

export async function myStats(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ active: number; drafts: number; pending: number; views: number; leads: number }>`
    select
      coalesce(sum(case when status = 'PUBLISHED' then 1 else 0 end), 0)::int as active,
      coalesce(sum(case when status = 'DRAFT' then 1 else 0 end), 0)::int as drafts,
      coalesce(sum(case when status = 'PENDING_REVIEW' then 1 else 0 end), 0)::int as pending,
      coalesce(sum(views), 0)::int as views,
      coalesce(sum(whatsapp_leads), 0)::int as leads
    from listings where user_id = ${userId}
  `;
  const saved = await sql<{ n: number }>`select count(*)::int as n from saved_listings where user_id = ${userId}`;
  return {
    active: Number(rows[0]?.active ?? 0),
    drafts: Number(rows[0]?.drafts ?? 0),
    pending: Number(rows[0]?.pending ?? 0),
    views: Number(rows[0]?.views ?? 0),
    leads: Number(rows[0]?.leads ?? 0),
    saved: Number(saved[0]?.n ?? 0),
  };
}

export async function myLeads(userId: string) {
  const sql = await getSql();
  return sql<{ id: number; event: string; listingId: number | null; title: string | null; createdAt: string }>`
    select e.id, e.event, e.listing_id as "listingId", l.title, e.created_at::text as "createdAt"
    from analytics_events e
    left join listings l on l.id = e.listing_id
    where e.user_id is null
      and e.listing_id in (select id from listings where user_id = ${userId})
      and e.event in ('whatsapp_click', 'phone_click', 'listing_view')
    order by e.id desc
    limit 40
  `;
}

export async function savedIds(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ id: number }>`select listing_id as id from saved_listings where user_id = ${userId}`;
  return rows.map((row) => Number(row.id));
}

export async function savedListings(userId: string) {
  const sql = await getSql();
  const rows = await sql.query<Listing>(
    `${LISTING_SELECT} where l.id in (select listing_id from saved_listings where user_id = $1) order by l.published_at desc nulls last`,
    [userId],
  );
  return rows.map(asListing);
}

export async function toggleSaved(userId: string, listingId: number) {
  const sql = await getSql();
  const existing = await sql<{ listing_id: number }>`
    select listing_id from saved_listings where user_id = ${userId} and listing_id = ${listingId}
  `;
  if (existing[0]) {
    await sql`delete from saved_listings where user_id = ${userId} and listing_id = ${listingId}`;
    return { saved: false };
  }
  const found = await sql<{ id: number }>`select id from listings where id = ${listingId}`;
  if (!found[0]) throw new Error("Listing not found");
  await sql`insert into saved_listings (user_id, listing_id) values (${userId}, ${listingId})`;
  await trackEvent("save_listing", listingId, userId, {});
  return { saved: true };
}

export async function getOwnedListing(userId: string, id: number): Promise<ListingDetail | null> {
  const sql = await getSql();
  const rows = await sql.query<Listing>(`${LISTING_SELECT} where l.id = $1 and l.user_id = $2`, [id, userId]);
  const row = rows[0];
  if (!row) return null;
  const images = await imagesFor(sql, id);
  return { ...asListing(row), images };
}

function photoOk(url: string) {
  return /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=\s]+$/i.test(url) && url.length < 1_500_000;
}

export async function saveListing(userId: string, input: ListingDraft): Promise<{ ok: true; id: number; status: string } | { ok: false; errors: string[] }> {
  const errors: string[] = [];
  const type = input.type === "SALE" ? "SALE" : input.type === "RENT" ? "RENT" : "";
  if (!type) errors.push("Choose rent or sale.");
  const make = cleanText(input.make, 40);
  const model = cleanText(input.model, 40);
  const variant = cleanText(input.variant, 40);
  if (!make) errors.push("Enter the make.");
  if (!model) errors.push("Enter the model.");
  const year = Number(input.year);
  if (!Number.isInteger(year) || year < 1990 || year > 2027) errors.push("Enter a valid year.");
  const bodyType = cleanText(input.bodyType, 30);
  const category = cleanText(input.category, 40);
  const transmission = cleanText(input.transmission, 20);
  const fuel = cleanText(input.fuel, 20);
  if (!bodyType || !category || !transmission || !fuel) errors.push("Complete the vehicle details.");
  const seats = Number(input.seats);
  if (!Number.isInteger(seats) || seats < 2 || seats > 15) errors.push("Enter the number of seats.");
  const mileage = Number(input.mileage);
  if (!Number.isFinite(mileage) || mileage < 0 || mileage > 2_000_000) errors.push("Enter a valid mileage.");
  const areaSlug = cleanText(input.areaSlug, 60);
  if (!areaSlug) errors.push("Choose a location.");
  const description = cleanText(input.description, 4000);
  const whatsapp = digits(cleanText(input.whatsapp, 20));
  const phone = digits(cleanText(input.phone, 20));
  const photos = Array.isArray(input.photos) ? input.photos.slice(0, 8) : [];
  if (input.intent === "publish") {
    if (!whatsapp.startsWith("971") || !/^971\d{8,9}$/.test(whatsapp)) errors.push("WhatsApp must be a UAE number starting with +971.");
    if (photos.length < 1) errors.push("Add at least one photo to publish.");
  }
  for (const photo of photos) {
    if (!photoOk(photo.url)) errors.push("One of the photos is not a valid JPG, PNG, or WebP.");
  }
  const accountType = ["individual", "rental_company", "dealer", "business"].includes(input.advertiser?.accountType)
    ? input.advertiser.accountType
    : "";
  const fullName = cleanText(input.advertiser?.fullName, 80);
  const companyName = cleanText(input.advertiser?.companyName, 80);
  if (!accountType) errors.push("Choose an account type.");
  if (!fullName) errors.push("Enter your name.");
  if (accountType !== "individual" && !companyName) errors.push("Enter the company name.");
  const logo = cleanText(input.advertiser?.logoUrl, 1_500_000);
  if (logo && !photoOk(logo)) errors.push("The logo must be a JPG, PNG, or WebP.");

  const price = (value: number | null) => {
    if (value == null || value === ("" as unknown)) return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || n > 50_000_000) return Number.NaN;
    return Math.round(n);
  };
  const daily = price(input.dailyPrice);
  const weekly = price(input.weeklyPrice);
  const monthly = price(input.monthlyPrice);
  const deposit = price(input.deposit);
  const sale = price(input.salePrice);
  if ([daily, weekly, monthly, deposit, sale].some((n) => Number.isNaN(n))) errors.push("Enter prices as whole numbers.");
  if (input.intent === "publish" && type === "RENT" && daily == null && weekly == null && monthly == null) {
    errors.push("Add at least one rental price.");
  }
  if (input.intent === "publish" && type === "SALE" && (sale == null || sale <= 0)) {
    errors.push("Enter the sale price.");
  }
  if (errors.length) return { ok: false, errors: [...new Set(errors)] };

  const sql = await getSql();
  const places = await sql<{ emirate: string; area: string; slug: string; scope: string }>`
    select emirate, area, slug, scope from locations where slug = ${areaSlug} and active = true
  `;
  const place = places[0];
  if (!place) return { ok: false, errors: ["Choose a location."] };
  const cats = await sql<{ slug: string }>`select slug from categories where slug = ${category}`;
  if (!cats[0]) return { ok: false, errors: ["Choose a category."] };

  const site = await readSite();
  const existingId = Number(input.id ?? 0);
  let status = input.intent === "publish" ? (site.moderation === "auto" ? "PUBLISHED" : "PENDING_REVIEW") : "DRAFT";
  if (existingId && input.intent === "publish") {
    const prev = await sql.query<{
      status: string;
      make: string;
      model: string;
      variant: string;
      year: number;
      body_type: string;
      area_slug: string;
      whatsapp: string;
      phone: string;
      mileage: number;
      pickup_location: string;
      daily_price: number | null;
      weekly_price: number | null;
      monthly_price: number | null;
      deposit: number | null;
      price: number | null;
    }>(
      `select l.status, l.make, l.model, l.variant, l.year, l.body_type, l.area_slug, l.whatsapp, l.phone,
        l.mileage, l.pickup_location, r.daily_price, r.weekly_price, r.monthly_price, r.deposit, s.price
       from listings l
       left join rental_details r on r.listing_id = l.id
       left join sale_details s on s.listing_id = l.id
       where l.id = $1 and l.user_id = $2`,
      [existingId, userId],
    );
    const old = prev[0];
    if (old && (old.status === "PUBLISHED" || old.status === "PAUSED")) {
      const oldPhotos = await sql.query<{ url: string }>(
        "select url from vehicle_images where listing_id = $1 order by sort_order asc, id asc",
        [existingId],
      );
      const same = (a: unknown, b: unknown) => String(a ?? "") === String(b ?? "");
      const numSame = (a: number | null, b: number | null) => Number(a ?? -1) === Number(b ?? -1);
      const material = !(
        same(old.make, make) &&
        same(old.model, model) &&
        same(old.variant, variant) &&
        Number(old.year) === year &&
        same(old.body_type, bodyType) &&
        same(old.area_slug, areaSlug) &&
        same(old.whatsapp, whatsapp) &&
        same(old.phone, phone) &&
        Number(old.mileage) === Math.round(mileage) &&
        same(old.pickup_location, cleanText(input.pickupLocation, 160)) &&
        numSame(old.daily_price, daily) &&
        numSame(old.weekly_price, weekly) &&
        numSame(old.monthly_price, monthly) &&
        numSame(old.deposit, deposit) &&
        numSame(old.price, sale) &&
        oldPhotos.map((photo) => photo.url).join("\n") === photos.map((photo) => photo.url).join("\n")
      );
      if (!material) status = old.status;
      else if (site.moderation === "manual" && site.remoderateEdits) status = "PENDING_REVIEW";
      else status = old.status === "PAUSED" ? "PAUSED" : "PUBLISHED";
    }
  }
  const displayName = accountType === "individual" ? fullName : companyName;
  const seller = sellerTypeFor(accountType);
  const title = `${year} ${make} ${model}${variant ? ` ${variant}` : ""}`.replace(/\s+/g, " ").trim();
  const slugVehicle = slugify(`${make} ${model}`);
  const slugArea = place.slug;

  await sql`
    update profiles set
      full_name = ${fullName},
      phone = ${phone},
      whatsapp = ${whatsapp},
      account_type = ${accountType},
      role = case when role in ('admin', 'super_admin') then role else 'advertiser' end,
      updated_at = now()
    where user_id = ${userId}
  `;

  const existingCompany = await sql<{ id: number; slug: string }>`
    select id, slug from companies where user_id = ${userId} order by id asc limit 1
  `;
  let companyId = existingCompany[0] ? Number(existingCompany[0].id) : 0;
  const companyFields = {
    name: displayName,
    salesperson: cleanText(input.advertiser.salespersonName, 80),
    description: cleanText(input.advertiser.description, 1200),
    email: cleanText(input.advertiser.email, 120),
    website: cleanText(input.advertiser.website, 160),
    address: cleanText(input.advertiser.address, 160),
    area: place.area || place.emirate,
  };
  if (!companyId) {
    let slug = slugify(displayName);
    const clash = await sql<{ id: number }>`select id from companies where slug = ${slug}`;
    if (clash[0]) slug = `${slug}-${userId.slice(0, 6).toLowerCase()}`;
    const inserted = await sql<{ id: number }>`
      insert into companies (
        user_id, slug, name, salesperson_name, account_type, description, logo_url, phone, whatsapp,
        email, website, address, emirate, area
      ) values (
        ${userId}, ${slug}, ${companyFields.name}, ${companyFields.salesperson}, ${accountType},
        ${companyFields.description}, ${logo}, ${phone}, ${whatsapp}, ${companyFields.email},
        ${companyFields.website}, ${companyFields.address}, ${place.emirate}, ${companyFields.area}
      ) returning id
    `;
    companyId = Number(inserted[0]?.id);
  } else {
    await sql`
      update companies set
        name = ${companyFields.name},
        salesperson_name = ${companyFields.salesperson},
        account_type = ${accountType},
        description = ${companyFields.description},
        logo_url = case when ${logo} = '' then logo_url else ${logo} end,
        phone = ${phone},
        whatsapp = ${whatsapp},
        email = ${companyFields.email},
        website = ${companyFields.website},
        address = ${companyFields.address},
        emirate = ${place.emirate},
        area = ${companyFields.area}
      where id = ${companyId} and user_id = ${userId}
    `;
  }

  const listingValues = {
    title,
    slugVehicle,
    slugArea,
    make,
    model,
    variant,
    year,
    bodyType,
    category,
    transmission,
    fuel,
    engine: cleanText(input.engine, 40),
    seats,
    color: cleanText(input.color, 30),
    mileage: Math.round(mileage),
    spec: cleanText(input.regionalSpec, 30) || "GCC",
    emirate: place.emirate,
    area: place.scope === "emirate" ? place.emirate : place.area,
    pickup: cleanText(input.pickupLocation, 160),
    description,
    whatsapp,
    phone,
    preferred: input.preferredContact === "phone" ? "phone" : "whatsapp",
    withDriver: Boolean(input.withDriver),
    condition: input.condition === "new" ? "new" : "used",
    seller,
    status,
  };

  let listingId = Number(input.id ?? 0);
  if (listingId) {
    const owned = await sql<{ id: number }>`select id from listings where id = ${listingId} and user_id = ${userId}`;
    if (!owned[0]) return { ok: false, errors: ["That listing is not on your account."] };
    await sql.query(
      `update listings set
        company_id = $1, type = $2, status = $3, title = $4, slug_vehicle = $5, slug_area = $6,
        make = $7, model = $8, variant = $9, year = $10, body_type = $11, category = $12,
        transmission = $13, fuel = $14, engine = $15, seats = $16, color = $17, mileage = $18,
        regional_spec = $19, emirate = $20, area = $21, area_slug = $22, pickup_location = $23,
        description = $24, whatsapp = $25, phone = $26, preferred_contact = $27, with_driver = $28,
        condition = $29, seller_type = $30,
        published_at = case when $3 = 'PUBLISHED' then coalesce(published_at, now()) else null end,
        expires_at = case when $3 = 'PUBLISHED' then now() + interval '30 days' else null end,
        updated_at = now()
      where id = $31 and user_id = $32`,
      [
        companyId, type, listingValues.status, listingValues.title, listingValues.slugVehicle, listingValues.slugArea,
        listingValues.make, listingValues.model, listingValues.variant, listingValues.year, listingValues.bodyType, listingValues.category,
        listingValues.transmission, listingValues.fuel, listingValues.engine, listingValues.seats, listingValues.color, listingValues.mileage,
        listingValues.spec, listingValues.emirate, listingValues.area, slugArea, listingValues.pickup,
        listingValues.description, listingValues.whatsapp, listingValues.phone, listingValues.preferred, listingValues.withDriver,
        listingValues.condition, listingValues.seller, listingId, userId,
      ],
    );
  } else {
    const inserted = await sql.query<{ id: number }>(
      `insert into listings (
        company_id, user_id, type, status, title, slug_vehicle, slug_area, make, model, variant, year,
        body_type, category, transmission, fuel, engine, seats, color, mileage, regional_spec, emirate,
        area, area_slug, pickup_location, description, whatsapp, phone, preferred_contact, with_driver,
        condition, seller_type, published_at, expires_at
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,
        case when $4 = 'PUBLISHED' then now() else null end,
        case when $4 = 'PUBLISHED' then now() + interval '30 days' else null end
      ) returning id`,
      [
        companyId, userId, type, listingValues.status, listingValues.title, listingValues.slugVehicle, listingValues.slugArea,
        listingValues.make, listingValues.model, listingValues.variant, listingValues.year, listingValues.bodyType, listingValues.category,
        listingValues.transmission, listingValues.fuel, listingValues.engine, listingValues.seats, listingValues.color, listingValues.mileage,
        listingValues.spec, listingValues.emirate, listingValues.area, slugArea, listingValues.pickup, listingValues.description,
        listingValues.whatsapp, listingValues.phone, listingValues.preferred, listingValues.withDriver, listingValues.condition, listingValues.seller,
      ],
    );
    listingId = Number(inserted[0]?.id);
  }

  await sql`delete from rental_details where listing_id = ${listingId}`;
  await sql`delete from sale_details where listing_id = ${listingId}`;
  await sql`delete from vehicle_images where listing_id = ${listingId}`;
  if (type === "RENT") {
    await sql`
      insert into rental_details (
        listing_id, daily_price, weekly_price, monthly_price, deposit, min_period, mileage_allowance,
        extra_mileage_price, insurance, driver_requirements, delivery,
        delivery_available, delivery_scope, delivery_areas, delivery_fee, airport_delivery
      ) values (
        ${listingId}, ${daily}, ${weekly}, ${monthly}, ${deposit},
        ${cleanText(input.minPeriod, 40)}, ${cleanText(input.mileageAllowance, 80)},
        ${cleanText(input.extraMileagePrice, 40)}, ${cleanText(input.insurance, 240)},
        ${cleanText(input.driverRequirements, 240)}, ${cleanText(input.delivery, 240)},
        ${Boolean(input.deliveryAvailable)},
        ${input.deliveryAvailable && (input.deliveryScope === "dubai" || input.deliveryScope === "areas") ? input.deliveryScope : ""},
        ${cleanText(input.deliveryAreas, 240)},
        ${cleanText(input.deliveryFee, 80)},
        ${Boolean(input.deliveryAvailable && input.airportDelivery)}
      )
    `;
  } else {
    await sql`
      insert into sale_details (listing_id, price, accident_history, service_history, warranty, registration_status)
      values (
        ${listingId}, ${sale ?? 0}, ${cleanText(input.accidentHistory, 240)}, ${cleanText(input.serviceHistory, 240)},
        ${cleanText(input.warranty, 240)}, ${cleanText(input.registrationStatus, 160)}
      )
    `;
  }
  if (photos.length) {
    const values: string[] = [];
    const params: unknown[] = [];
    photos.forEach((photo, index) => {
      const base = index * 5;
      values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
      params.push(listingId, photo.url, cleanText(photo.alt, 140) || title, index, index === 0);
    });
    await sql.query(
      `insert into vehicle_images (listing_id, url, alt, sort_order, is_primary) values ${values.join(", ")}`,
      params,
    );
  }
  await trackEvent(input.intent === "publish" ? "publish_listing" : "post_listing", listingId, userId, { type });
  return { ok: true, id: listingId, status };
}

export async function setOwnListingStatus(userId: string, id: number, action: string) {
  const sql = await getSql();
  const rows = await sql<{ status: string }>`select status from listings where id = ${id} and user_id = ${userId}`;
  const current = rows[0]?.status;
  if (!current) throw new Error("Listing not found");
  if (action === "delete") {
    await sql`update listings set status = 'DELETED', updated_at = now() where id = ${id} and user_id = ${userId}`;
    return { ok: true, status: "DELETED" };
  }
  let next = current;
  if (action === "pause" && current === "PUBLISHED") next = "PAUSED";
  if (action === "resume" && current === "PAUSED") next = "PUBLISHED";
  if (action === "sold") next = "SOLD";
  if (action === "rented") next = "RENTED";
  if (action === "renew" && (current === "EXPIRED" || current === "PUBLISHED" || current === "PAUSED")) {
    const site = await readSite();
    next = current === "EXPIRED" && site.moderation === "manual" ? "PENDING_REVIEW" : current === "PAUSED" ? "PAUSED" : "PUBLISHED";
    await sql`
      update listings set status = ${next},
        expires_at = now() + interval '30 days',
        published_at = case when ${next} = 'PUBLISHED' then coalesce(published_at, now()) else published_at end,
        updated_at = now()
      where id = ${id} and user_id = ${userId}
    `;
    return { ok: true, status: next };
  }
  if (next === current) return { ok: true, status: current };
  await sql`update listings set status = ${next}, updated_at = now() where id = ${id} and user_id = ${userId}`;
  return { ok: true, status: next };
}

export async function submitReport(input: { listingId: number | null; userId: string | null; reason: string; details: string }) {
  const reason = cleanText(input.reason, 80);
  const details = cleanText(input.details, 1000);
  if (!reason) return { ok: false as const, error: "Choose a reason." };
  const key = input.userId ?? "anon";
  if (!rateLimit(`report:${key}`, 8, 60 * 60 * 1000)) return { ok: false as const, error: "Please wait before sending another report." };
  const sql = await getSql();
  await sql`
    insert into reports (listing_id, reporter_user_id, reason, details)
    values (${input.listingId}, ${input.userId}, ${reason}, ${details})
  `;
  return { ok: true as const };
}

export async function submitContact(input: { name: string; email: string; topic: string; message: string; company?: string }) {
  const name = cleanText(input.name, 80);
  const email = cleanText(input.email, 120);
  const topic = cleanText(input.topic, 80) || "general";
  const message = cleanText(input.message, 2000);
  if (input.company?.trim()) return { ok: true as const };
  if (!name || !email.includes("@") || message.length < 8) return { ok: false as const, error: "Add your name, email, and a short message." };
  if (!rateLimit(`contact:${email.toLowerCase()}`, 4, 60 * 60 * 1000)) return { ok: false as const, error: "Too many messages. Try again later." };
  if (!rateLimit("contact", 30, 60 * 60 * 1000)) return { ok: false as const, error: "Too many messages. Try again later." };
  const sql = await getSql();
  await sql`insert into contact_messages (name, email, topic, message) values (${name}, ${email}, ${topic}, ${message})`;
  return { ok: true as const };
}

export async function sitemapEntries() {
  const sql = await getSql();
  const rows = await sql<{ type: string; slugVehicle: string; slugArea: string; id: number; updatedAt: string }>`
    select l.type, l.slug_vehicle as "slugVehicle", l.slug_area as "slugArea", l.id, l.updated_at::text as "updatedAt"
    from listings l
    join companies c on c.id = l.company_id
    where l.status = 'PUBLISHED' and c.is_demo = false and c.suspended = false
      and (l.expires_at is null or l.expires_at > now())
    order by l.id
  `;
  const dealers = await sql<{ slug: string }>`
    select slug from companies where suspended = false and is_demo = false
    and exists (
      select 1 from listings l where l.company_id = companies.id and l.status = 'PUBLISHED'
    )
  `;
  const locations = await sql<{ slug: string; updatedAt: string }>`
    select l.area_slug as slug, max(l.updated_at)::text as "updatedAt"
    from listings l
    join companies c on c.id = l.company_id
    where l.status = 'PUBLISHED' and c.is_demo = false and c.suspended = false
      and (l.expires_at is null or l.expires_at > now())
      and l.area_slug <> ''
    group by l.area_slug
  `;
  return { listings: rows.map((row) => ({ ...row, id: Number(row.id) })), dealers, locations };
}

export async function adminOverview(userId: string) {
  await requireStaff(userId);
  const sql = await getSql();
  const listings = await sql<{ status: string; n: number }>`select status, count(*)::int as n from listings group by status`;
  const users = await sql<{ n: number }>`select count(*)::int as n from profiles`;
  const companies = await sql<{ n: number }>`select count(*)::int as n from companies`;
  const reports = await sql<{ n: number }>`select count(*)::int as n from reports where status = 'open'`;
  return {
    listings: listings.map((row) => ({ status: row.status, n: Number(row.n) })),
    users: Number(users[0]?.n ?? 0),
    companies: Number(companies[0]?.n ?? 0),
    openReports: Number(reports[0]?.n ?? 0),
  };
}

export async function adminListings(userId: string, status: string) {
  await requireStaff(userId);
  const sql = await getSql();
  const allowed = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "PAUSED", "EXPIRED", "SOLD", "RENTED", "REJECTED", "DELETED", ""];
  const filter = allowed.includes(status) ? status : "";
  const rows = filter
    ? await sql.query<Listing>(`${LISTING_SELECT} where l.status = $1 order by l.updated_at desc limit 100`, [filter])
    : await sql.query<Listing>(`${LISTING_SELECT} order by l.updated_at desc limit 100`);
  return rows.map(asListing);
}

export async function adminSetListing(userId: string, id: number, patch: { status?: string; featured?: boolean }) {
  await requireStaff(userId);
  const sql = await getSql();
  const statuses = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "PAUSED", "EXPIRED", "SOLD", "RENTED", "REJECTED", "DELETED"];
  if (patch.status && statuses.includes(patch.status)) {
    await sql.query(
      `update listings set status = $1,
        published_at = case when $1 = 'PUBLISHED' then coalesce(published_at, now()) else published_at end,
        expires_at = case when $1 = 'PUBLISHED' then coalesce(expires_at, now() + interval '30 days') else expires_at end,
        is_featured = case when $2::boolean is null then is_featured else $2::boolean end,
        promotion_tier = case when $2::boolean is true then 'featured' when $2::boolean is false then 'none' else promotion_tier end,
        updated_at = now()
      where id = $3`,
      [patch.status, patch.featured ?? null, id],
    );
  } else if (typeof patch.featured === "boolean") {
    await sql`
      update listings set is_featured = ${patch.featured},
        promotion_tier = ${patch.featured ? "featured" : "none"},
        updated_at = now()
      where id = ${id}
    `;
  }
  return { ok: true };
}

export async function adminUsers(userId: string) {
  await requireStaff(userId);
  const sql = await getSql();
  const rows = await sql<{
    userId: string;
    fullName: string;
    email: string;
    role: string;
    suspended: boolean;
    accountType: string;
    createdAt: string;
  }>`
    select user_id as "userId", full_name as "fullName", email, role, suspended,
      account_type as "accountType", created_at::text as "createdAt"
    from profiles order by created_at desc limit 200
  `;
  return rows.map((row) => ({ ...row, suspended: Boolean(row.suspended) }));
}

export async function adminSetUser(actorId: string, targetId: string, patch: { suspended?: boolean; role?: string }) {
  const actor = await requireStaff(actorId);
  const sql = await getSql();
  if (typeof patch.suspended === "boolean") {
    await sql`update profiles set suspended = ${patch.suspended}, updated_at = now() where user_id = ${targetId}`;
    if (patch.suspended) await sql`update companies set suspended = true where user_id = ${targetId}`;
    if (!patch.suspended) await sql`update companies set suspended = false where user_id = ${targetId} and is_demo = false`;
  }
  if (patch.role && actor.role === "super_admin" && ["user", "advertiser", "admin", "super_admin"].includes(patch.role)) {
    if (targetId === actorId && patch.role !== "super_admin") throw new Error("You cannot remove your own admin access.");
    await sql`update profiles set role = ${patch.role}, updated_at = now() where user_id = ${targetId}`;
  }
  return { ok: true };
}

export async function adminCompanies(userId: string) {
  await requireStaff(userId);
  const sql = await getSql();
  return sql<{
    id: number;
    slug: string;
    name: string;
    accountType: string;
    verified: boolean;
    plan: string;
    suspended: boolean;
    isDemo: boolean;
    emirate: string;
    area: string;
  }>`
    select id, slug, name, account_type as "accountType", verified, plan, suspended, is_demo as "isDemo", emirate, area
    from companies order by id desc limit 200
  `;
}

export async function adminSetCompany(
  userId: string,
  id: number,
  patch: { verified?: boolean; suspended?: boolean; plan?: string; note?: string },
) {
  await requireStaff(userId);
  const sql = await getSql();
  if (typeof patch.verified === "boolean") {
    await sql`
      update companies set verified = ${patch.verified},
        verification_note = ${cleanText(patch.note, 240)}
      where id = ${id}
    `;
    await sql`
      insert into verifications (company_id, status, notes, reviewed_by)
      values (${id}, ${patch.verified ? "approved" : "rejected"}, ${cleanText(patch.note, 240)}, ${userId})
    `;
  }
  if (typeof patch.suspended === "boolean") {
    await sql`update companies set suspended = ${patch.suspended} where id = ${id}`;
  }
  if (patch.plan && ["free", "dealer", "premium"].includes(patch.plan)) {
    await sql`update companies set plan = ${patch.plan} where id = ${id}`;
  }
  return { ok: true };
}

export async function adminReports(userId: string) {
  await requireStaff(userId);
  const sql = await getSql();
  return sql<{
    id: number;
    listingId: number | null;
    title: string | null;
    reason: string;
    details: string;
    status: string;
    createdAt: string;
  }>`
    select r.id, r.listing_id as "listingId", l.title, r.reason, r.details, r.status, r.created_at::text as "createdAt"
    from reports r left join listings l on l.id = r.listing_id
    order by r.id desc limit 100
  `;
}

export async function adminSetReport(userId: string, id: number, status: string) {
  await requireStaff(userId);
  if (!["open", "reviewed", "dismissed"].includes(status)) return { ok: false };
  const sql = await getSql();
  await sql`update reports set status = ${status} where id = ${id}`;
  return { ok: true };
}

export async function adminMessages(userId: string) {
  await requireStaff(userId);
  const sql = await getSql();
  return sql<{ id: number; name: string; email: string; topic: string; message: string; createdAt: string }>`
    select id, name, email, topic, message, created_at::text as "createdAt"
    from contact_messages order by id desc limit 50
  `;
}

export async function adminSaveCategory(userId: string, input: { id?: number; slug: string; name: string }) {
  await requireStaff(userId);
  const sql = await getSql();
  const name = cleanText(input.name, 40);
  const slug = slugify(input.slug || name);
  if (!name) return { ok: false as const, error: "Enter a name." };
  if (input.id) {
    await sql`update categories set name = ${name} where id = ${input.id}`;
  } else {
    await sql`insert into categories (slug, name, sort_order) values (${slug}, ${name}, 50) on conflict (slug) do update set name = excluded.name`;
  }
  return { ok: true as const };
}

export async function adminSaveLocation(
  userId: string,
  input: {
    id?: number;
    emirate: string;
    area: string;
    slug?: string;
    parentSlug?: string;
    popular?: boolean;
    sortOrder?: number;
    active?: boolean;
  },
) {
  await requireStaff(userId);
  const emirate = cleanText(input.emirate, 40);
  const area = cleanText(input.area, 80);
  if (!emirate || !area) return { ok: false as const, error: "Enter an emirate and area." };
  const slug = slugify(input.slug || area).slice(0, 60);
  const parentSlug = slugify(input.parentSlug || "");
  if (parentSlug === slug) return { ok: false as const, error: "A location cannot be its own parent." };
  const popular = Boolean(input.popular);
  const active = input.active !== false;
  const sortOrder = Number.isFinite(Number(input.sortOrder)) ? Math.max(0, Math.min(9999, Math.round(Number(input.sortOrder)))) : 100;
  const sql = await getSql();
  if (parentSlug) {
    const parent = await sql<{ slug: string }>`select slug from locations where slug = ${parentSlug}`;
    if (!parent[0]) return { ok: false as const, error: "Parent location was not found." };
  }
  const scope = "area";
  if (input.id) {
    const clash = await sql<{ id: number }>`select id from locations where slug = ${slug} and id <> ${input.id}`;
    if (clash[0]) return { ok: false as const, error: "That slug is already used." };
    await sql`
      update locations set
        emirate = ${emirate}, area = ${area}, slug = ${slug}, parent_slug = ${parentSlug},
        popular = ${popular}, sort_order = ${sortOrder}, active = ${active}, scope = ${scope}
      where id = ${input.id}
    `;
    return { ok: true as const };
  }
  await sql`
    insert into locations (emirate, area, slug, scope, popular, sort_order, parent_slug, active)
    values (${emirate}, ${area}, ${slug}, ${scope}, ${popular}, ${sortOrder}, ${parentSlug}, ${active})
    on conflict (slug) do update set
      emirate = excluded.emirate,
      area = excluded.area,
      parent_slug = excluded.parent_slug,
      popular = excluded.popular,
      sort_order = excluded.sort_order,
      active = excluded.active
  `;
  return { ok: true as const };
}

export async function adminSaveSite(userId: string, input: unknown) {
  await requireStaff(userId);
  const next = normalizeSite(input);
  const sql = await getSql();
  await sql`
    insert into site_settings (key, value) values ('identity', ${JSON.stringify(next)}::jsonb)
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
  return next;
}

const PAGE_KEYS = ["privacy", "terms", "disclaimer", "safety", "cookies"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export function normalizePages(value: unknown): Record<PageKey, string> {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const out = { privacy: "", terms: "", disclaimer: "", safety: "", cookies: "" };
  for (const key of PAGE_KEYS) out[key] = cleanText(source[key], 20000);
  return out;
}

export async function readPages() {
  const sql = await getSql();
  const rows = await sql<{ value: unknown }>`select value from site_settings where key = 'pages'`;
  return normalizePages(rows[0]?.value);
}

export async function adminSavePages(userId: string, input: unknown) {
  await requireStaff(userId);
  const pages = normalizePages(input);
  const sql = await getSql();
  await sql`
    insert into site_settings (key, value) values ('pages', ${JSON.stringify(pages)}::jsonb)
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
  return pages;
}

export async function updateProfile(
  userId: string,
  input: { fullName: string; phone: string; whatsapp: string; accountType: string; companyName: string; salespersonName: string },
) {
  const accountType = ["individual", "rental_company", "dealer", "business"].includes(input.accountType) ? input.accountType : "";
  const fullName = cleanText(input.fullName, 80);
  if (!accountType || !fullName) return { ok: false as const, error: "Enter your name and account type." };
  const phone = digits(cleanText(input.phone, 20));
  const whatsapp = digits(cleanText(input.whatsapp, 20));
  const sql = await getSql();
  await sql`
    update profiles set
      full_name = ${fullName}, phone = ${phone}, whatsapp = ${whatsapp}, account_type = ${accountType}, updated_at = now()
    where user_id = ${userId}
  `;
  const companyName = cleanText(input.companyName, 80);
  const salesperson = cleanText(input.salespersonName, 80);
  const existing = await sql<{ id: number }>`select id from companies where user_id = ${userId} and is_demo = false order by id asc limit 1`;
  if (existing[0] && (accountType === "individual" || companyName)) {
    await sql`
      update companies set
        name = ${accountType === "individual" ? fullName : companyName},
        salesperson_name = ${salesperson},
        account_type = ${accountType},
        phone = ${phone},
        whatsapp = ${whatsapp}
      where id = ${Number(existing[0].id)} and user_id = ${userId}
    `;
  }
  return { ok: true as const };
}

export async function resolveLanding(input: { type: "RENT" | "SALE"; makeSlug?: string; modelSlug?: string; areaSlug?: string }) {
  if (input.areaSlug) {
    const place = await getPlace(input.areaSlug);
    if (!place) return null;
    const result = await searchListings({ type: input.type, limit: 24, facets: false }, { type: input.type, area: place.slug });
    if (!result.total) return null;
    const real = result.items.filter((item) => !item.isDemo).length;
    return { kind: "area" as const, place, make: "", model: "", result, indexable: real >= 2 };
  }
  if (!input.makeSlug) return null;
  const sql = await getSql();
  const makes = await sql.query<{ make: string }>(
    `select distinct l.make as make from listings l join companies c on c.id = l.company_id where ${PUBLIC_WHERE} and l.type = $1`,
    [input.type],
  );
  const make = makes.find((row) => slugify(row.make) === input.makeSlug)?.make;
  if (!make) return null;
  let model = "";
  if (input.modelSlug) {
    const models = await sql.query<{ model: string }>(
      `select distinct l.model as model from listings l join companies c on c.id = l.company_id where ${PUBLIC_WHERE} and l.type = $1 and l.make = $2`,
      [input.type, make],
    );
    model = models.find((row) => slugify(row.model) === input.modelSlug)?.model ?? "";
    if (!model) return null;
  }
  const result = await searchListings(
    { type: input.type, limit: 24, facets: false },
    { type: input.type, make, model: model || undefined },
  );
  if (!result.total) return null;
  const real = result.items.filter((item) => !item.isDemo).length;
  return { kind: "make" as const, place: null, make, model, result, indexable: real >= 2 };
}

export async function indexableCatalog() {
  const sql = await getSql();
  const rows = await sql.query<{ type: string; make: string; model: string; areaSlug: string; emirate: string; isDemo: boolean }>(
    `select l.type, l.make, l.model, l.area_slug as "areaSlug", l.emirate, c.is_demo as "isDemo"
     from listings l join companies c on c.id = l.company_id
     where ${PUBLIC_WHERE}`,
  );
  const makes = new Map<string, { all: number; real: number; make: string; type: string }>();
  const models = new Map<string, { all: number; real: number; make: string; model: string; type: string }>();
  const areas = new Map<string, { all: number; real: number; type: string; slug: string }>();
  for (const row of rows) {
    const demo = Boolean(row.isDemo);
    const makeKey = `${row.type}:${slugify(row.make)}`;
    const makeRow = makes.get(makeKey) ?? { all: 0, real: 0, make: row.make, type: row.type };
    makeRow.all += 1;
    if (!demo) makeRow.real += 1;
    makes.set(makeKey, makeRow);
    const modelKey = `${row.type}:${slugify(row.make)}:${slugify(row.model)}`;
    const modelRow = models.get(modelKey) ?? { all: 0, real: 0, make: row.make, model: row.model, type: row.type };
    modelRow.all += 1;
    if (!demo) modelRow.real += 1;
    models.set(modelKey, modelRow);
    if (row.emirate === "Dubai" && row.areaSlug) {
      const areaKey = `${row.type}:${row.areaSlug}`;
      const areaRow = areas.get(areaKey) ?? { all: 0, real: 0, type: row.type, slug: row.areaSlug };
      areaRow.all += 1;
      if (!demo) areaRow.real += 1;
      areas.set(areaKey, areaRow);
    }
  }
  return {
    makes: [...makes.values()].filter((row) => row.all > 0),
    models: [...models.values()].filter((row) => row.all > 0),
    areas: [...areas.values()].filter((row) => row.all > 0),
  };
}

