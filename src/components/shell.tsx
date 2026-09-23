import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouteContext, useRouterState } from "@tanstack/react-router";
import { CarFront, Heart, Menu, Plus, Search, Tag, UserRound, X } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { inquiryMessage, whatsappHref } from "@/lib/format";
import { ensureProfile, getSavedIds, toggleSaved, trackPublic } from "@/lib/marketplace/fns";
import type { Listing, Profile } from "@/lib/marketplace/types";
import type { SiteConfig } from "@/lib/site";
import { Mark } from "@/components/ui";
import { cn } from "@/lib/cn";

type ShellValue = {
  saved: number[];
  toggleSave: (id: number) => void;
  contact: (listing: Listing) => void;
  profile: Profile | null;
};

const ShellContext = createContext<ShellValue | null>(null);

export function useShell() {
  const value = useContext(ShellContext);
  if (!value) throw new Error("Shell missing");
  return value;
}

export function Shell({ children }: { children: ReactNode }) {
  const { site } = useRouteContext({ from: "__root__" });
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [saved, setSaved] = useState<number[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"RENT" | "SALE">("RENT");
  const [sample, setSample] = useState<{ title: string; message: string } | null>(null);
  const [cookies, setCookies] = useState(true);

  useEffect(() => {
    setCookies(window.localStorage.getItem("marq-cookie") === "1");
  }, []);

  useEffect(() => {
    if (!user || user.isDevFallback) return;
    void ensureProfile({ data: { name: user.displayName ?? "", email: user.primaryEmail ?? "" } })
      .then(setProfile)
      .catch(() => setProfile(null));
    void getSavedIds()
      .then(setSaved)
      .catch(() => setSaved([]));
  }, [user]);

  useEffect(() => {
    setMenu(false);
    setSearchOpen(false);
  }, [path]);

  const value: ShellValue = {
    saved,
    profile,
    toggleSave: (id) => {
      if (!user) {
        void navigate({ to: "/login", search: { redirect: path } });
        return;
      }
      setSaved((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
      void toggleSaved({ data: { id } })
        .then((result) => {
          setSaved((current) => {
            const has = current.includes(id);
            if (result.saved && !has) return [...current, id];
            if (!result.saved && has) return current.filter((item) => item !== id);
            return current;
          });
        })
        .catch(() => {
          setSaved((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
        });
    },
    contact: (listing) => {
      const message = inquiryMessage(site.name, listing);
      void trackPublic({ data: { event: "whatsapp_click", listingId: listing.id, meta: { type: listing.type } } });
      if (listing.isDemo || !listing.whatsapp) {
        setSample({ title: listing.title, message });
        return;
      }
      window.open(whatsappHref(listing.whatsapp, message), "_blank", "noopener,noreferrer");
    },
  };

  const staff = profile?.role === "admin" || profile?.role === "super_admin";

  return (
    <ShellContext.Provider value={value}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            {site.logoUrl ? <img src={site.logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-xl object-cover" /> : <Mark name={site.name} />}
            <span className="truncate font-display text-xl leading-none text-ink sm:text-2xl">{site.name}</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
            <NavLink to="/rent" label="Rent" />
            <NavLink to="/buy" label="Buy" />
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" aria-label="Search cars" onClick={() => setSearchOpen(true)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand">
              <Search className="size-5" />
            </button>
            <Link to="/account" search={{ section: "saved" }} aria-label="Saved cars" className="hidden h-11 w-11 place-items-center rounded-full hover:bg-sand lg:grid">
              <Heart className="size-5" />
            </Link>
            {user ? (
              <Link to="/post" className="hidden h-11 items-center gap-1 rounded-full bg-pine px-4 text-sm font-medium text-paper lg:inline-flex">
                <Plus className="size-4" aria-hidden="true" />
                Post Your Car
              </Link>
            ) : (
              <Link to="/login" search={{ redirect: "/post" }} className="hidden h-11 items-center gap-1 rounded-full bg-pine px-4 text-sm font-medium text-paper lg:inline-flex">
                <Plus className="size-4" aria-hidden="true" />
                Post Your Car
              </Link>
            )}
            {isPending ? <span className="h-10 w-16 animate-pulse rounded-full bg-sand" /> : null}
            {!isPending && !user ? (
              <Link to="/login" search={{ redirect: "/account" }} className="hidden h-11 items-center rounded-full px-3 text-sm font-medium hover:bg-sand lg:inline-flex">
                Sign in
              </Link>
            ) : null}
            {!isPending && user ? (
              <Link to="/account" search={{ section: "listings" }} className="hidden h-11 items-center rounded-full px-3 text-sm font-medium hover:bg-sand lg:inline-flex">
                Account
              </Link>
            ) : null}
            <button type="button" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} onClick={() => setMenu((open) => !open)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand lg:hidden">
              {menu ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {menu ? (
          <div className="border-t border-line bg-card px-4 py-4 lg:hidden">
            <div className="grid gap-2 text-base">
              <Link to="/rent" className="rounded-2xl px-3 py-3 hover:bg-sand">Rent a car</Link>
              <Link to="/buy" className="rounded-2xl px-3 py-3 hover:bg-sand">Buy a car</Link>
              {user ? (
                <Link to="/post" className="rounded-full bg-pine px-3 py-3 text-center text-paper">Post Your Car</Link>
              ) : (
                <Link to="/login" search={{ redirect: "/post" }} className="rounded-full bg-pine px-3 py-3 text-center text-paper">Post Your Car</Link>
              )}
              <Link to="/account" search={{ section: "saved" }} className="rounded-2xl px-3 py-3 hover:bg-sand">Saved cars</Link>
              <Link to="/safety" className="rounded-2xl px-3 py-3 hover:bg-sand">Safety</Link>
              {staff ? <Link to="/admin" className="rounded-2xl px-3 py-3 hover:bg-sand">Admin</Link> : null}
            </div>
          </div>
        ) : null}
      </header>

      {searchOpen ? (
        <div className="fixed inset-0 z-40 bg-ink/40" onClick={() => setSearchOpen(false)}>
          <div className="mx-auto mt-20 max-w-lg rounded-3xl bg-card p-4" role="dialog" aria-label="Search" onClick={(event) => event.stopPropagation()}>
            <p className="text-sm font-medium text-ink">What are you looking for?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setMode("RENT")} className={cn("h-11 rounded-full text-sm", mode === "RENT" ? "bg-pine text-paper" : "bg-sand text-ink")}>Rent</button>
              <button type="button" onClick={() => setMode("SALE")} className={cn("h-11 rounded-full text-sm", mode === "SALE" ? "bg-pine text-paper" : "bg-sand text-ink")}>Buy</button>
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                setSearchOpen(false);
                void navigate({ to: mode === "RENT" ? "/rent" : "/buy", search: query ? { q: query } : {} });
              }}
            >
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="BMW, G-Class, Marina" className="h-12 flex-1 rounded-2xl border border-line px-3 text-sm" aria-label="Search" />
              <button type="submit" className="h-12 rounded-full bg-pine px-4 text-sm font-medium text-paper">Search</button>
            </form>
          </div>
        </div>
      ) : null}

      <div id="main">{children}</div>

      <footer className="mt-16 border-t border-line bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              {site.logoUrl ? <img src={site.logoUrl} alt="" className="h-9 w-9 rounded-xl object-cover" /> : <Mark name={site.name} />}
              <span className="font-display text-2xl">{site.name}</span>
            </div>
            <p className="mt-3 text-sm text-ink-soft">{site.description}</p>
            <SocialLinks site={site} />
          </div>
          <FooterCol title="Marketplace">
            <Link to="/rent">Rent</Link>
            <Link to="/buy">Buy</Link>
            <Link to="/post">Post a car</Link>
            <Link to="/about">About</Link>
            <Link to="/dubai/$intent" params={{ intent: "car-rental" }}>Dubai car rental</Link>
            <Link to="/dubai/$intent" params={{ intent: "cars-for-sale" }}>Dubai cars for sale</Link>
          </FooterCol>
          <FooterCol title="Areas">
            <Link to="/locations/$slug" params={{ slug: "dubai-marina" }}>Dubai Marina</Link>
            <Link to="/locations/$slug" params={{ slug: "downtown-dubai" }}>Downtown Dubai</Link>
            <Link to="/locations/$slug" params={{ slug: "jvc" }}>JVC</Link>
            <Link to="/locations/$slug" params={{ slug: "business-bay" }}>Business Bay</Link>
            <Link to="/locations/$slug" params={{ slug: "al-quoz" }}>Al Quoz</Link>
          </FooterCol>
          <FooterCol title="Help">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/safety">Safety</Link>
            <Link to="/marketplace-disclaimer">Marketplace disclaimer</Link>
            <Link to="/report-listing">Report a listing</Link>
            <Link to="/terms-and-conditions">Terms & conditions</Link>
            <Link to="/privacy-policy">Privacy policy</Link>
            <Link to="/cookie-policy">Cookie policy</Link>
          </FooterCol>
        </div>
        <div className="border-t border-line">
          <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted">
            © {new Date().getFullYear()} {site.legalName}. All rights reserved. {site.legalName} is a marketplace. It does not own the cars listed by advertisers, and it is not a party to the rental or sale. Details are supplied by advertisers — check the vehicle, the paperwork and the payment terms before you send money. Sample cars are not real offers. {site.email}
          </p>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 border-t border-line bg-card lg:hidden" aria-label="Mobile">
        <Tab to="/rent" icon={<CarFront className="size-5" />} label="Rent" />
        <Tab to="/buy" icon={<Tag className="size-5" />} label="Buy" />
        {user ? (
          <Link to="/post" className="flex flex-col items-center justify-center gap-1 text-xs">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-pine text-paper"><Plus className="size-5" /></span>
            Post
          </Link>
        ) : (
          <Link to="/login" search={{ redirect: "/post" }} className="flex flex-col items-center justify-center gap-1 text-xs">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-pine text-paper"><Plus className="size-5" /></span>
            Post
          </Link>
        )}
        <Tab to="/account" search={{ section: "saved" }} icon={<Heart className="size-5" />} label="Saved" />
        <Tab to={user ? "/account" : "/login"} search={user ? { section: "listings" } : { redirect: "/account" }} icon={<UserRound className="size-5" />} label="Account" />
      </nav>
      <div className="h-16 lg:hidden" />

      {!cookies ? (
        <div className="fixed inset-x-3 bottom-20 z-30 rounded-3xl border border-line bg-card p-4 shadow-sm lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm">
          <p className="text-sm text-ink-soft">We use essential cookies so you can stay signed in. No advertising cookies are set.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="h-11 rounded-full bg-pine px-4 text-sm font-medium text-paper"
              onClick={() => {
                window.localStorage.setItem("marq-cookie", "1");
                setCookies(true);
              }}
            >
              OK
            </button>
            <Link to="/cookie-policy" className="inline-flex h-11 items-center px-3 text-sm text-pine">Cookie policy</Link>
          </div>
        </div>
      ) : null}

      {sample ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="sample-title">
          <div className="w-full max-w-md rounded-3xl bg-card p-5">
            <h2 id="sample-title" className="text-2xl text-ink">Sample listing</h2>
            <p className="mt-2 text-sm text-ink-soft">
              This car is here so you can explore {site.name}. It is not connected to a real advertiser, so WhatsApp will not open a chat.
            </p>
            <p className="mt-4 rounded-2xl bg-paper p-3 text-sm text-ink">{sample.message}</p>
            <button type="button" className="mt-4 h-12 w-full rounded-full bg-pine text-sm font-medium text-paper" onClick={() => setSample(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </ShellContext.Provider>
  );
}

function NavLink({ to, label }: { to: "/rent" | "/buy"; label: string }) {
  return (
    <Link to={to} className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft hover:bg-sand hover:text-ink" activeProps={{ className: "rounded-full bg-sand px-3 py-2 text-sm font-medium text-ink" }}>
      {label}
    </Link>
  );
}

function SocialLinks({ site }: { site: SiteConfig }) {
  const links = [
    ["Instagram", site.instagram],
    ["Facebook", site.facebook],
    ["TikTok", site.tiktok],
    ["YouTube", site.youtube],
    ["LinkedIn", site.linkedin],
    ["X", site.x],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  if (!links.length) return null;
  return (
    <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
      {links.map(([label, href]) => (
        <a key={label} href={href} rel="noopener noreferrer">{label}</a>
      ))}
    </p>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid content-start gap-2 text-sm text-ink-soft [&_a]:hover:text-ink">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">{title}</p>
      {children}
    </div>
  );
}

function Tab({
  to,
  search,
  icon,
  label,
}: {
  to: "/rent" | "/buy" | "/account" | "/login";
  search?: { section: "saved" | "listings" } | { redirect: string };
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link to={to} search={search} className="flex flex-col items-center justify-center gap-1 text-xs text-muted" activeProps={{ className: "flex flex-col items-center justify-center gap-1 text-xs text-pine" }}>
      {icon}
      {label}
    </Link>
  );
}
