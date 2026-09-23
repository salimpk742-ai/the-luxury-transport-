export type SiteConfig = {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phone: string;
  supportWhatsapp: string;
  instagram: string;
  x: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
  logoUrl: string;
  metaTitle: string;
  metaDescription: string;
  googleVerification: string;
  market: string;
  country: string;
  moderation: "manual" | "auto";
  /** When manual review is on, material edits to a live listing go back to review. */
  remoderateEdits: boolean;
};

export const defaultSite: SiteConfig = {
  name: "The Luxury Cars",
  legalName: "The Luxury Cars",
  tagline: "Find your next car in Dubai",
  description:
    "The Luxury Cars is a Dubai automotive marketplace connecting customers with rental companies, dealers, businesses and private vehicle sellers.",
  url: "https://theluxurycars.com",
  email: "theluxrytransport@gmail.com",
  phone: "",
  supportWhatsapp: "",
  instagram: "",
  x: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  linkedin: "",
  logoUrl: "",
  metaTitle: "",
  metaDescription: "",
  googleVerification: "",
  market: "Dubai, United Arab Emirates",
  country: "United Arab Emirates",
  moderation: "manual",
  remoderateEdits: true,
};

function clip(value: unknown, fallback: string, max: number) {
  if (typeof value !== "string") return fallback;
  const next = value.replace(/<[^>]*>/g, "").trim().slice(0, max);
  return next || fallback;
}

function optionalClip(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").trim().slice(0, max);
}

function httpsOrEmpty(value: unknown) {
  const next = optionalClip(value, 200);
  return /^https:\/\/[^\s]+$/i.test(next) ? next.replace(/\/$/, "") : "";
}

function verificationCode(value: unknown) {
  const raw = optionalClip(value, 160);
  const fromTag = raw.match(/content\s*=\s*["']([A-Za-z0-9_-]+)["']/i);
  const token = (fromTag?.[1] ?? raw).trim();
  return /^[A-Za-z0-9_-]{8,80}$/.test(token) ? token : "";
}

export function normalizeSite(value: unknown): SiteConfig {
  const v = value && typeof value === "object" ? (value as Partial<SiteConfig>) : {};
  const url = clip(v.url, defaultSite.url, 160);
  const logo = optionalClip(v.logoUrl, 200);
  return {
    name: clip(v.name, defaultSite.name, 60),
    legalName: clip(v.legalName, defaultSite.legalName, 80),
    tagline: clip(v.tagline, defaultSite.tagline, 80),
    description: clip(v.description, defaultSite.description, 400),
    url: /^https?:\/\/[^\s]+$/i.test(url) ? url.replace(/\/$/, "") : defaultSite.url,
    email: clip(v.email, defaultSite.email, 80),
    phone: optionalClip(v.phone, 20),
    supportWhatsapp: optionalClip(v.supportWhatsapp, 20),
    instagram: httpsOrEmpty(v.instagram),
    x: httpsOrEmpty(v.x),
    facebook: httpsOrEmpty(v.facebook),
    tiktok: httpsOrEmpty(v.tiktok),
    youtube: httpsOrEmpty(v.youtube),
    linkedin: httpsOrEmpty(v.linkedin),
    logoUrl: /^https:\/\/[^\s]+$/i.test(logo) ? logo : "",
    metaTitle: optionalClip(v.metaTitle, 90),
    metaDescription: optionalClip(v.metaDescription, 200),
    googleVerification: verificationCode(v.googleVerification),
    market: clip(v.market, defaultSite.market, 80),
    country: clip(v.country, defaultSite.country, 60),
    moderation: v.moderation === "auto" ? "auto" : "manual",
    remoderateEdits: v.remoderateEdits !== false,
  };
}

export function siteTitle(site: SiteConfig, page?: string) {
  const brand = site.name;
  return page ? `${page} | ${brand}` : `${brand} | Car Rental & Cars for Sale in Dubai`;
}

export function siteDescription(site: SiteConfig) {
  return site.metaDescription || site.description;
}

export function siteFromMatches(matches: ReadonlyArray<{ context: unknown }>): SiteConfig {
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const site = (matches[i]?.context as { site?: SiteConfig } | undefined)?.site;
    if (site?.name) return normalizeSite(site);
  }
  return defaultSite;
}
