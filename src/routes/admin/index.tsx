import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  adminCompanies,
  adminDirectories,
  adminListings,
  adminMessages,
  adminOverview,
  adminReports,
  adminSaveCategory,
  adminSaveLocation,
  adminSavePages,
  adminSaveSite,
  adminSetCompany,
  adminSetListing,
  adminSetReport,
  adminSetUser,
  adminUsers,
  getPageCopy,
  getSite,
} from "@/lib/marketplace/fns";
import type { SiteConfig } from "@/lib/site";
import { noindexHead } from "@/lib/seo";
import { statusLabel } from "@/lib/format";
import { LoadingBlock } from "@/components/states";
import { Button, Field, TextInput } from "@/components/ui";
import { toast } from "sonner";

const tabs = ["overview", "listings", "users", "companies", "reports", "locations", "categories", "pages", "settings"] as const;

export const Route = createFileRoute("/admin/")({
  head: () => noindexHead("Admin"),
  component: AdminPage,
});

function AdminPage() {
  const { user, isPending } = useCurrentUserState();
  const [tab, setTab] = useState<(typeof tabs)[number]>("overview");
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof adminOverview>> | null>(null);

  useEffect(() => {
    if (!user) return;
    void adminOverview()
      .then((data) => {
        setOverview(data);
        setAllowed(true);
      })
      .catch(() => setAllowed(false));
  }, [user]);

  if (isPending) return <LoadingBlock label="Opening admin" />;
  if (!user) return <RedirectToSignIn />;
  if (allowed === null) return <LoadingBlock label="Checking access" />;
  if (!allowed) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-4xl text-ink">Admin is locked</h1>
        <p className="mt-3 text-ink-soft">This account is not an admin. The first person to open an account on a new marketplace becomes the super admin.</p>
      </main>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-4xl text-ink">Admin</h1>
      <div className="mt-4 flex gap-2 overflow-auto">
        {tabs.map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`h-11 shrink-0 rounded-full px-4 text-sm capitalize ${tab === item ? "bg-pine text-paper" : "bg-card"}`}>
            {item}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "overview" && overview ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <p className="rounded-3xl bg-card p-4">{overview.users} people · {overview.companies} advertisers · {overview.openReports} open reports</p>
            <ul className="rounded-3xl bg-card p-4 text-sm">
              {overview.listings.map((row) => <li key={row.status}>{statusLabel(row.status)} · {row.n}</li>)}
            </ul>
          </div>
        ) : null}
        {tab === "listings" ? <ListingsPanel /> : null}
        {tab === "users" ? <UsersPanel /> : null}
        {tab === "companies" ? <CompaniesPanel /> : null}
        {tab === "reports" ? <ReportsPanel /> : null}
        {tab === "locations" ? <LocationsPanel /> : null}
        {tab === "categories" ? <CategoriesPanel /> : null}
        {tab === "pages" ? <PagesPanel /> : null}
        {tab === "settings" ? <SettingsPanel /> : null}
      </div>
    </div>
  );
}

function ListingsPanel() {
  const [status, setStatus] = useState("PENDING_REVIEW");
  const [rows, setRows] = useState<Awaited<ReturnType<typeof adminListings>>>([]);
  const load = (next = status) => void adminListings({ data: { status: next } }).then(setRows);
  useEffect(() => { load("PENDING_REVIEW"); }, []);
  return (
    <div>
      <label className="text-sm">Status
        <select className="ml-2 h-11 rounded-full border border-line bg-card px-3" value={status} onChange={(event) => { setStatus(event.target.value); load(event.target.value); }}>
          {["", "PENDING_REVIEW", "PUBLISHED", "DRAFT", "PAUSED", "REJECTED", "SOLD", "RENTED", "EXPIRED", "DELETED"].map((item) => <option key={item} value={item}>{item || "All recent"}</option>)}
        </select>
      </label>
      <ul className="mt-4 divide-y divide-line rounded-3xl border border-line bg-card">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
            <span>{row.title} · {statusLabel(row.status)}{row.isDemo ? " · sample" : ""}</span>
            <span className="flex gap-2">
              <button type="button" className="rounded-full bg-pine px-3 py-2 text-paper" onClick={() => void adminSetListing({ data: { id: row.id, status: "PUBLISHED" } }).then(() => { toast.success("Published"); load(); })}>Publish</button>
              <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void adminSetListing({ data: { id: row.id, status: "REJECTED" } }).then(() => load())}>Reject</button>
              <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void adminSetListing({ data: { id: row.id, featured: !row.isFeatured } }).then(() => load())}>{row.isFeatured ? "Unfeature" : "Feature"}</button>
              <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void adminSetListing({ data: { id: row.id, status: "PAUSED" } }).then(() => load())}>Pause</button>
              <button type="button" className="rounded-full border border-line px-3 py-2 text-danger" onClick={() => void adminSetListing({ data: { id: row.id, status: "DELETED" } }).then(() => { toast.success("Removed from search"); load(); })}>Remove</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UsersPanel() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof adminUsers>>>([]);
  const load = () => void adminUsers().then(setRows);
  useEffect(() => { load(); }, []);
  return (
    <ul className="divide-y divide-line rounded-3xl border border-line bg-card text-sm">
      {rows.map((row) => (
        <li key={row.userId} className="flex flex-wrap items-center justify-between gap-2 p-4">
          <span>{row.fullName || row.email} · {row.role}{row.suspended ? " · suspended" : ""}</span>
          <span className="flex gap-2">
            <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void adminSetUser({ data: { userId: row.userId, suspended: !row.suspended } }).then(load)}>{row.suspended ? "Restore" : "Suspend"}</button>
            <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void adminSetUser({ data: { userId: row.userId, role: "admin" } }).then(load)}>Make admin</button>
          </span>
        </li>
      ))}
    </ul>
  );
}

function CompaniesPanel() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof adminCompanies>>>([]);
  const load = () => void adminCompanies().then(setRows);
  useEffect(() => { load(); }, []);
  return (
    <ul className="divide-y divide-line rounded-3xl border border-line bg-card text-sm">
      {rows.map((row) => (
        <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
          <span>{row.name} · {row.plan}{row.verified ? " · verified" : ""}{row.isDemo ? " · sample" : ""}{row.suspended ? " · suspended" : ""}</span>
          <span className="flex flex-wrap gap-2">
            <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void adminSetCompany({ data: { id: Number(row.id), verified: !row.verified, note: row.verified ? "Verification removed by admin." : "Marked verified by admin." } }).then(load)}>{row.verified ? "Remove badge" : "Verify"}</button>
            <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void adminSetCompany({ data: { id: Number(row.id), plan: row.plan === "premium" ? "free" : "premium" } }).then(load)}>Toggle premium</button>
            <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void adminSetCompany({ data: { id: Number(row.id), suspended: !row.suspended } }).then(load)}>{row.suspended ? "Unsuspend" : "Suspend"}</button>
          </span>
        </li>
      ))}
    </ul>
  );
}

function ReportsPanel() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof adminReports>>>([]);
  const [messages, setMessages] = useState<Awaited<ReturnType<typeof adminMessages>>>([]);
  useEffect(() => {
    void adminReports().then(setRows);
    void adminMessages().then(setMessages);
  }, []);
  return (
    <div className="space-y-6">
      <ul className="divide-y divide-line rounded-3xl border border-line bg-card text-sm">
        {rows.length === 0 ? <li className="p-4 text-muted">No reports.</li> : null}
        {rows.map((row) => (
          <li key={row.id} className="p-4">
            <p className="font-medium">{row.reason} · {row.title ?? "Listing removed"} · {row.status}</p>
            <p className="text-ink-soft">{row.details}</p>
            <button type="button" className="mt-2 text-pine" onClick={() => void adminSetReport({ data: { id: Number(row.id), status: "reviewed" } }).then(() => adminReports().then(setRows))}>Mark reviewed</button>
          </li>
        ))}
      </ul>
      <div>
        <h2 className="text-2xl text-ink">Contact messages</h2>
        <ul className="mt-3 divide-y divide-line rounded-3xl border border-line bg-card text-sm">
          {messages.length === 0 ? <li className="p-4 text-muted">No messages.</li> : null}
          {messages.map((row) => (
            <li key={row.id} className="p-4">
              <p className="font-medium">{row.name} · {row.email} · {row.topic}</p>
              <p>{row.message}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LocationsPanel() {
  const [places, setPlaces] = useState<Awaited<ReturnType<typeof adminDirectories>>["places"]>([]);
  const [filter, setFilter] = useState("");
  const [emirate, setEmirate] = useState("Dubai");
  const [area, setArea] = useState("");
  const [slug, setSlug] = useState("");
  const [parentSlug, setParentSlug] = useState("");
  const [sortOrder, setSortOrder] = useState("100");
  const [editing, setEditing] = useState<number | null>(null);
  const load = () => void adminDirectories().then((data) => setPlaces(data.places));
  useEffect(() => { load(); }, []);
  const shown = places.filter((place) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return place.area.toLowerCase().includes(q) || place.slug.includes(q) || place.emirate.toLowerCase().includes(q);
  });
  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <form className="space-y-3 rounded-3xl bg-card p-4" onSubmit={(event) => {
        event.preventDefault();
        void adminSaveLocation({ data: { id: editing ?? undefined, emirate, area, slug, parentSlug, sortOrder: Number(sortOrder), popular: false, active: true } }).then((result) => {
          if (!result.ok) { toast.error(result.error); return; }
          toast.success(editing ? "Location updated" : "Location saved");
          setArea(""); setSlug(""); setParentSlug(""); setEditing(null);
          load();
        });
      }}>
        <h2 className="text-2xl text-ink">{editing ? "Edit location" : "Add location"}</h2>
        <Field label="Emirate"><TextInput value={emirate} onChange={(event) => setEmirate(event.target.value)} /></Field>
        <Field label="Area"><TextInput value={area} onChange={(event) => setArea(event.target.value)} /></Field>
        <Field label="SEO slug"><TextInput value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="Filled from the name if empty" /></Field>
        <Field label="Parent slug"><TextInput value={parentSlug} onChange={(event) => setParentSlug(event.target.value)} placeholder="Optional, for a neighbourhood" /></Field>
        <Field label="Display order"><TextInput inputMode="numeric" value={sortOrder} onChange={(event) => setSortOrder(event.target.value.replace(/[^\d]/g, ""))} /></Field>
        <Button type="submit">{editing ? "Save location" : "Add location"}</Button>
        <p className="text-sm text-muted">{places.length} locations. Duplicate slugs update the existing row.</p>
      </form>
      <div>
        <TextInput value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Search locations" aria-label="Search locations" />
        <ul className="mt-3 max-h-[32rem] divide-y divide-line overflow-auto rounded-3xl border border-line bg-card text-sm">
          {shown.map((place) => (
            <li key={place.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <span>
                {place.area}, {place.emirate}
                <span className="text-muted"> · {place.slug}{place.parentSlug ? ` · parent ${place.parentSlug}` : ""}{place.active ? "" : " · inactive"}</span>
              </span>
              <span className="flex gap-2">
                <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => { setEditing(place.id); setEmirate(place.emirate); setArea(place.area); setSlug(place.slug); setParentSlug(place.parentSlug); setSortOrder(String(place.sortOrder)); }}>Edit</button>
                <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void adminSaveLocation({ data: { id: place.id, emirate: place.emirate, area: place.area, slug: place.slug, parentSlug: place.parentSlug, sortOrder: place.sortOrder, popular: place.popular, active: !place.active } }).then(() => load())}>{place.active ? "Deactivate" : "Activate"}</button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PagesPanel() {
  const [pages, setPages] = useState({ privacy: "", terms: "", disclaimer: "", safety: "", cookies: "" });
  useEffect(() => {
    void Promise.all([
      getPageCopy({ data: { key: "privacy" } }),
      getPageCopy({ data: { key: "terms" } }),
      getPageCopy({ data: { key: "disclaimer" } }),
      getPageCopy({ data: { key: "safety" } }),
      getPageCopy({ data: { key: "cookies" } }),
    ]).then(([privacy, terms, disclaimer, safety, cookies]) => setPages({ privacy, terms, disclaimer, safety, cookies }));
  }, []);
  const fields = [
    ["privacy", "Privacy policy"],
    ["terms", "Terms and conditions"],
    ["disclaimer", "Marketplace disclaimer"],
    ["safety", "Safety"],
    ["cookies", "Cookie policy"],
  ] as const;
  return (
    <form className="grid max-w-3xl gap-4" onSubmit={(event) => {
      event.preventDefault();
      void adminSavePages({ data: pages }).then(() => toast.success("Pages saved"));
    }}>
      <p className="text-sm text-muted">Leave a box empty to keep the built-in draft. Text you save replaces that page. These drafts still need a UAE-qualified lawyer before launch.</p>
      {fields.map(([key, label]) => (
        <Field key={key} label={label}>
          <textarea value={pages[key]} onChange={(event) => setPages({ ...pages, [key]: event.target.value })} rows={6} className="w-full rounded-2xl border border-line bg-card p-3 text-sm" />
        </Field>
      ))}
      <Button type="submit">Save page text</Button>
    </form>
  );
}

function CategoriesPanel() {
  const [name, setName] = useState("");
  const [info, setInfo] = useState("");
  useEffect(() => { void adminDirectories().then((data) => setInfo(`${data.categories.length} categories`)); }, []);
  return (
    <form className="max-w-md space-y-3 rounded-3xl bg-card p-4" onSubmit={(event) => { event.preventDefault(); void adminSaveCategory({ data: { name, slug: name } }).then((result) => {
      if (result.ok) { toast.success("Category saved"); setName(""); void adminDirectories().then((data) => setInfo(`${data.categories.length} categories`)); }
      else toast.error(result.error);
    }); }}>
      <h2 className="text-2xl text-ink">Category</h2>
      <p className="text-sm text-muted">{info}</p>
      <Field label="Name"><TextInput value={name} onChange={(event) => setName(event.target.value)} /></Field>
      <Button type="submit">Add category</Button>
    </form>
  );
}

function SearchConsoleNote({ site }: { site: SiteConfig }) {
  return (
    <section className="max-w-xl rounded-3xl border border-line bg-card p-4 text-sm leading-6 text-ink-soft">
      <h2 className="text-2xl text-ink">Search Console</h2>
      <p className="mt-2">Nothing below is marked done from inside this app. Indexing and rankings are not guaranteed, and the site is not verified until you finish the steps in Google.</p>
      <ol className="mt-3 list-decimal space-y-1 pl-5">
        <li>Open Google Search Console.</li>
        <li>Add the domain property theluxurycars.com.</li>
        <li>Verify ownership with the DNS TXT record Google gives you. A meta code, if you use that method, goes in the field above. Leave it empty until then.</li>
        <li>Submit {site.url.replace(/\/$/, "")}/sitemap.xml.</li>
        <li>Use URL Inspection on the homepage, rent, buy, and any category or location page you care about.</li>
        <li>Watch indexing, mobile rendering and Core Web Vitals after the domain is live.</li>
        <li>Keep sample listings noindex, and keep drafts, accounts and admin out of the sitemap.</li>
      </ol>
      <p className="mt-3">Legal pages should be reviewed and finalized by qualified UAE legal counsel before commercial launch. Do not describe the site as government approved or as guaranteed to rank.</p>
    </section>
  );
}

function SettingsPanel() {
  const [site, setSite] = useState<SiteConfig | null>(null);
  useEffect(() => { void getSite().then(setSite); }, []);
  if (!site) return <LoadingBlock />;
  const update = (key: keyof SiteConfig, value: string) => setSite({ ...site, [key]: value });
  return (
    <form
      className="grid max-w-xl gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void adminSaveSite({ data: site }).then((next) => { setSite(next); toast.success("Site settings saved"); });
      }}
    >
      <Field label="Site name"><TextInput value={site.name} onChange={(event) => update("name", event.target.value)} /></Field>
      <Field label="Legal name"><TextInput value={site.legalName} onChange={(event) => update("legalName", event.target.value)} /></Field>
      <Field label="Tagline"><TextInput value={site.tagline} onChange={(event) => update("tagline", event.target.value)} /></Field>
      <Field label="Description">
        <textarea value={site.description} onChange={(event) => update("description", event.target.value)} rows={4} className="w-full rounded-2xl border border-line bg-card p-3 text-sm" />
      </Field>
      <Field label="Public URL"><TextInput value={site.url} onChange={(event) => update("url", event.target.value)} /></Field>
      <Field label="Logo URL"><TextInput value={site.logoUrl} onChange={(event) => update("logoUrl", event.target.value)} placeholder="https://" /></Field>
      <Field label="Meta title"><TextInput value={site.metaTitle} onChange={(event) => update("metaTitle", event.target.value)} placeholder="Optional. Replaces the site name in titles" /></Field>
      <Field label="Meta description"><TextInput value={site.metaDescription} onChange={(event) => update("metaDescription", event.target.value)} /></Field>
      <Field label="Contact email"><TextInput value={site.email} onChange={(event) => update("email", event.target.value)} /></Field>
      <Field label="Contact phone"><TextInput value={site.phone} onChange={(event) => update("phone", event.target.value)} /></Field>
      <Field label="Support WhatsApp"><TextInput value={site.supportWhatsapp} onChange={(event) => update("supportWhatsapp", event.target.value)} /></Field>
      <Field label="Instagram"><TextInput value={site.instagram} onChange={(event) => update("instagram", event.target.value)} /></Field>
      <Field label="X"><TextInput value={site.x} onChange={(event) => update("x", event.target.value)} /></Field>
      <Field label="Facebook"><TextInput value={site.facebook} onChange={(event) => update("facebook", event.target.value)} placeholder="https://" /></Field>
      <Field label="TikTok"><TextInput value={site.tiktok} onChange={(event) => update("tiktok", event.target.value)} placeholder="https://" /></Field>
      <Field label="YouTube"><TextInput value={site.youtube} onChange={(event) => update("youtube", event.target.value)} placeholder="https://" /></Field>
      <Field label="LinkedIn"><TextInput value={site.linkedin} onChange={(event) => update("linkedin", event.target.value)} placeholder="https://" /></Field>
      <Field label="Google Search Console verification"><TextInput value={site.googleVerification} onChange={(event) => update("googleVerification", event.target.value)} placeholder="Leave empty until Google gives you a code" /></Field>
      <Field label="Listing review">
        <select className="h-12 w-full rounded-2xl border border-line bg-card px-3" value={site.moderation} onChange={(event) => setSite({ ...site, moderation: event.target.value === "auto" ? "auto" : "manual" })}>
          <option value="manual">Manual approval</option>
          <option value="auto">Auto publish</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={site.remoderateEdits} onChange={(event) => setSite({ ...site, remoderateEdits: event.target.checked })} />
        Send material edits of a live listing back to review
      </label>
      <Button type="submit">Save settings</Button>
      <SearchConsoleNote site={site} />
    </form>
  );
}
