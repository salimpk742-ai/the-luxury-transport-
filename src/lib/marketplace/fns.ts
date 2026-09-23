import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { defaultSite } from "@/lib/site";
import { parseListingSearch } from "@/lib/search";
import type { ListingDraft } from "@/lib/marketplace/types";

async function db() {
  return import("./queries.server");
}

function str(value: unknown, max = 80) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export const getSite = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await (await db()).readSite();
  } catch {
    return defaultSite;
  }
});

export const getHome = createServerFn({ method: "GET" }).handler(async () => {
  return (await db()).getHome();
});

export const getDirectories = createServerFn({ method: "GET" }).handler(async () => {
  const m = await db();
  const [places, categories] = await Promise.all([m.listPlaces(), m.listCategories()]);
  return { places, categories };
});

export const searchCars = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
    const scopeRaw = o.scope && typeof o.scope === "object" ? (o.scope as Record<string, unknown>) : {};
    const scopeType: "RENT" | "SALE" | undefined =
      scopeRaw.type === "RENT" || scopeRaw.type === "SALE" ? scopeRaw.type : undefined;
    return {
      search: parseListingSearch(o),
      type: o.type === "RENT" || o.type === "SALE" ? o.type : undefined,
      scope: {
        type: scopeType,
        category: str(scopeRaw.category, 40) || undefined,
        make: str(scopeRaw.make, 40) || undefined,
        condition: scopeRaw.condition === "new" || scopeRaw.condition === "used" ? scopeRaw.condition : undefined,
        area: str(scopeRaw.area, 60) || undefined,
        emirate: str(scopeRaw.emirate, 40) || undefined,
      },
    };
  })
  .handler(async ({ data }) => {
    const m = await db();
    const asType = (value: string | undefined) => (value === "RENT" || value === "SALE" ? value : undefined);
    const condition = data.scope.condition === "new" || data.scope.condition === "used" ? data.scope.condition : undefined;
    return m.searchListings(
      { ...data.search, type: asType(data.type) },
      {
        type: asType(data.scope.type),
        category: data.scope.category,
        make: data.scope.make,
        condition,
        area: data.scope.area,
        emirate: data.scope.emirate,
      },
    );
  });

export const getListing = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const id = Number((input as { id?: unknown })?.id);
    if (!Number.isInteger(id) || id < 1) throw new Error("Invalid listing");
    return { id };
  })
  .handler(async ({ data }) => (await db()).getPublicListing(data.id));

export const getDealer = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({ slug: str((input as { slug?: unknown })?.slug, 80) }))
  .handler(async ({ data }) => (await db()).getCompanyPublic(data.slug));

export const getPlacePage = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({ slug: str((input as { slug?: unknown })?.slug, 80) }))
  .handler(async ({ data }) => {
    const m = await db();
    const place = await m.getPlace(data.slug);
    if (!place) return null;
    const result = await m.searchListings(
      { limit: 24, sort: "featured" },
      place.scope === "emirate" ? { emirate: place.emirate } : { area: place.slug },
    );
    return { place, result };
  });

export const trackPublic = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const o = (input ?? {}) as { event?: unknown; listingId?: unknown; meta?: unknown };
    const event = str(o.event, 40);
    const allowed = ["search", "listing_view", "whatsapp_click", "phone_click"];
    if (!allowed.includes(event)) throw new Error("Unknown event");
    const listingId = Number(o.listingId);
    const metaIn = o.meta && typeof o.meta === "object" ? (o.meta as Record<string, unknown>) : {};
    const meta: Record<string, string> = {};
    for (const key of ["type", "make", "area", "q"]) {
      const value = metaIn[key];
      if (typeof value === "string") meta[key] = value.slice(0, 80);
    }
    return { event, listingId: Number.isInteger(listingId) ? listingId : null, meta };
  })
  .handler(async ({ data }) => {
    const m = await db();
    if (!m.rateLimit(`track:${data.event}`, 80, 60_000)) return { ok: false };
    await m.trackEvent(data.event, data.listingId, null, data.meta);
    return { ok: true };
  });

export const sendReport = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const o = (input ?? {}) as { listingId?: unknown; reason?: unknown; details?: unknown };
    const listingId = Number(o.listingId);
    return {
      listingId: Number.isInteger(listingId) ? listingId : null,
      reason: str(o.reason, 80),
      details: str(o.details, 1000),
    };
  })
  .handler(async ({ data }) => {
    const m = await db();
    return m.submitReport({ ...data, userId: null });
  });

export const sendContact = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const o = (input ?? {}) as Record<string, unknown>;
    return {
      name: str(o.name, 80),
      email: str(o.email, 120),
      topic: str(o.topic, 80),
      message: str(o.message, 2000),
      company: str(o.company, 80),
    };
  })
  .handler(async ({ data }) => (await db()).submitContact(data));

export const ensureProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const o = (input ?? {}) as { name?: unknown; email?: unknown };
    return { name: str(o.name, 80), email: str(o.email, 120) };
  })
  .handler(async ({ context, data }) => (await db()).ensureProfile(context.userId, data.name, data.email));

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => (await db()).getProfile(context.userId));

export const getAccount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const m = await db();
    const [profile, listings, stats, leads, saved] = await Promise.all([
      m.getProfile(context.userId),
      m.myListings(context.userId),
      m.myStats(context.userId),
      m.myLeads(context.userId),
      m.savedListings(context.userId),
    ]);
    return { profile, listings, stats, leads, saved };
  });

export const getSavedIds = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => (await db()).savedIds(context.userId));

export const toggleSaved = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const id = Number((input as { id?: unknown })?.id);
    if (!Number.isInteger(id)) throw new Error("Invalid listing");
    return { id };
  })
  .handler(async ({ context, data }) => (await db()).toggleSaved(context.userId, data.id));

export const getOwnedListing = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const id = Number((input as { id?: unknown })?.id);
    if (!Number.isInteger(id)) throw new Error("Invalid listing");
    return { id };
  })
  .handler(async ({ context, data }) => (await db()).getOwnedListing(context.userId, data.id));

export const saveMyListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Invalid listing");
    return input as ListingDraft;
  })
  .handler(async ({ context, data }) => (await db()).saveListing(context.userId, data));

export const setMyListingStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const o = (input ?? {}) as { id?: unknown; action?: unknown };
    const id = Number(o.id);
    const action = str(o.action, 20);
    if (!Number.isInteger(id)) throw new Error("Invalid listing");
    return { id, action };
  })
  .handler(async ({ context, data }) => (await db()).setOwnListingStatus(context.userId, data.id, data.action));

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => (await db()).adminOverview(context.userId));

export const adminListings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => ({ status: str((input as { status?: unknown })?.status, 30) }))
  .handler(async ({ context, data }) => (await db()).adminListings(context.userId, data.status));

export const adminSetListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const o = (input ?? {}) as { id?: unknown; status?: unknown; featured?: unknown };
    return {
      id: Number(o.id),
      status: str(o.status, 30),
      featured: typeof o.featured === "boolean" ? o.featured : undefined,
    };
  })
  .handler(async ({ context, data }) => (await db()).adminSetListing(context.userId, data.id, data));

export const adminUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => (await db()).adminUsers(context.userId));

export const adminSetUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const o = (input ?? {}) as { userId?: unknown; suspended?: unknown; role?: unknown };
    return {
      userId: str(o.userId, 80),
      suspended: typeof o.suspended === "boolean" ? o.suspended : undefined,
      role: str(o.role, 20) || undefined,
    };
  })
  .handler(async ({ context, data }) => (await db()).adminSetUser(context.userId, data.userId, data));

export const adminCompanies = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => (await db()).adminCompanies(context.userId));

export const adminSetCompany = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const o = (input ?? {}) as Record<string, unknown>;
    return {
      id: Number(o.id),
      verified: typeof o.verified === "boolean" ? o.verified : undefined,
      suspended: typeof o.suspended === "boolean" ? o.suspended : undefined,
      plan: str(o.plan, 20) || undefined,
      note: str(o.note, 240),
    };
  })
  .handler(async ({ context, data }) => (await db()).adminSetCompany(context.userId, data.id, data));

export const adminReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => (await db()).adminReports(context.userId));

export const adminSetReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const o = (input ?? {}) as { id?: unknown; status?: unknown };
    return { id: Number(o.id), status: str(o.status, 20) };
  })
  .handler(async ({ context, data }) => (await db()).adminSetReport(context.userId, data.id, data.status));

export const adminMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => (await db()).adminMessages(context.userId));

export const adminDirectories = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const m = await db();
    await m.adminOverview(context.userId);
    const [places, categories] = await Promise.all([m.listPlaces(true), m.listCategories()]);
    return { places, categories };
  });

export const adminSaveCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const o = (input ?? {}) as { id?: unknown; slug?: unknown; name?: unknown };
    return { id: Number(o.id) || undefined, slug: str(o.slug, 40), name: str(o.name, 40) };
  })
  .handler(async ({ context, data }) => (await db()).adminSaveCategory(context.userId, data));

export const adminSaveLocation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const o = (input ?? {}) as {
      id?: unknown;
      emirate?: unknown;
      area?: unknown;
      slug?: unknown;
      parentSlug?: unknown;
      popular?: unknown;
      sortOrder?: unknown;
      active?: unknown;
    };
    return {
      id: Number(o.id) || undefined,
      emirate: str(o.emirate, 40),
      area: str(o.area, 80),
      slug: str(o.slug, 60),
      parentSlug: str(o.parentSlug, 60),
      popular: Boolean(o.popular),
      sortOrder: Number(o.sortOrder) || 0,
      active: o.active !== false,
    };
  })
  .handler(async ({ context, data }) => (await db()).adminSaveLocation(context.userId, data));

export const adminSaveSite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => input)
  .handler(async ({ context, data }) => (await db()).adminSaveSite(context.userId, data));

export const getPageCopy = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const key = str((input as { key?: unknown })?.key, 20);
    return { key };
  })
  .handler(async ({ data }) => {
    const pages = await (await db()).readPages();
    if (data.key === "privacy" || data.key === "terms" || data.key === "disclaimer" || data.key === "safety" || data.key === "cookies") {
      return pages[data.key];
    }
    return "";
  });

export const adminSavePages = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => input)
  .handler(async ({ context, data }) => (await db()).adminSavePages(context.userId, data));

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const o = (input ?? {}) as Record<string, unknown>;
    return {
      fullName: str(o.fullName, 80),
      phone: str(o.phone, 20),
      whatsapp: str(o.whatsapp, 20),
      accountType: str(o.accountType, 40),
      companyName: str(o.companyName, 80),
      salespersonName: str(o.salespersonName, 80),
    };
  })
  .handler(async ({ context, data }) => (await db()).updateProfile(context.userId, data));

export const getLanding = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const o = (input ?? {}) as Record<string, unknown>;
    const type = o.type === "SALE" ? "SALE" : "RENT";
    return {
      type: type as "RENT" | "SALE",
      makeSlug: str(o.makeSlug, 80),
      modelSlug: str(o.modelSlug, 80),
      areaSlug: str(o.areaSlug, 80),
    };
  })
  .handler(async ({ data }) => (await db()).resolveLanding(data));

export const recordLogin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const kind = (input as { kind?: unknown })?.kind;
    return { kind: kind === "registration" ? "registration" : "login" };
  })
  .handler(async ({ context, data }) => {
    const m = await db();
    if (!m.rateLimit(`login:${context.userId}`, 6, 60 * 60 * 1000)) return { ok: true };
    await m.trackEvent(data.kind, null, context.userId, {});
    return { ok: true };
  });
