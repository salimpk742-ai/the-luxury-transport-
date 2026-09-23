import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { accountTypeLabel, statusLabel } from "@/lib/format";
import { ACCOUNT_TYPES } from "@/lib/catalog";
import { getAccount, saveMyProfile, setMyListingStatus } from "@/lib/marketplace/fns";
import type { Listing, Profile } from "@/lib/marketplace/types";
import { Button, Field, SelectInput, TextInput } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { EmptyState, LoadingBlock } from "@/components/states";
import { toast } from "sonner";
import { noindexHead } from "@/lib/seo";

const sections = ["listings", "saved", "leads", "profile"] as const;

export const Route = createFileRoute("/account/")({
  validateSearch: (search) => {
    const section = typeof search.section === "string" && sections.includes(search.section as (typeof sections)[number])
      ? (search.section as (typeof sections)[number])
      : "listings";
    return { section };
  },
  head: () => noindexHead("Your account"),
  component: AccountPage,
});

function AccountPage() {
  const { section } = Route.useSearch();
  const navigate = useNavigate({ from: "/account/" });
  const { user, isPending } = useCurrentUserState();
  const [data, setData] = useState<Awaited<ReturnType<typeof getAccount>> | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    void getAccount()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load your account."));
  };

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  if (isPending) return <LoadingBlock label="Checking your account" />;
  if (!user) return <RedirectToSignIn />;
  if (!data && !error) return <LoadingBlock label="Loading your account" />;

  const listings = data?.listings ?? [];
  const groups: { key: string; label: string; items: Listing[] }[] = [
    { key: "PUBLISHED", label: "Active", items: listings.filter((item) => item.status === "PUBLISHED") },
    { key: "PENDING_REVIEW", label: "Pending review", items: listings.filter((item) => item.status === "PENDING_REVIEW") },
    { key: "DRAFT", label: "Draft", items: listings.filter((item) => item.status === "DRAFT") },
    { key: "PAUSED", label: "Paused", items: listings.filter((item) => item.status === "PAUSED") },
    { key: "SOLD", label: "Sold", items: listings.filter((item) => item.status === "SOLD") },
    { key: "RENTED", label: "Rented", items: listings.filter((item) => item.status === "RENTED") },
    { key: "REJECTED", label: "Rejected", items: listings.filter((item) => item.status === "REJECTED") },
    { key: "EXPIRED", label: "Expired", items: listings.filter((item) => item.status === "EXPIRED") },
    { key: "DELETED", label: "Deleted", items: listings.filter((item) => item.status === "DELETED") },
  ];

  const act = async (id: number, action: string) => {
    try {
      await setMyListingStatus({ data: { id, action } });
      toast.success("Listing updated");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the listing");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl text-ink">Your account</h1>
          <p className="mt-1 text-sm text-muted">{data?.profile?.fullName || user.displayName}</p>
        </div>
        <div className="flex items-center gap-3">
          {data?.profile && (data.profile.role === "admin" || data.profile.role === "super_admin") ? (
            <Link to="/admin" className="text-sm font-medium text-pine">Admin</Link>
          ) : null}
          <UserButton />
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-danger" role="alert">{error}</p> : null}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Active listings" value={data?.stats.active ?? 0} />
        <Stat label="Total views" value={data?.stats.views ?? 0} />
        <Stat label="Saved cars" value={data?.stats.saved ?? 0} />
        <Stat label="WhatsApp leads" value={data?.stats.leads ?? 0} />
      </div>
      <div className="mt-6 flex gap-2 overflow-auto">
        {sections.map((item) => (
          <button key={item} type="button" onClick={() => void navigate({ search: { section: item } })} className={`h-11 shrink-0 rounded-full px-4 text-sm ${section === item ? "bg-pine text-paper" : "bg-card text-ink"}`}>
            {item === "listings" ? "My listings" : item === "saved" ? "Saved cars" : item === "leads" ? "Leads" : "Profile"}
          </button>
        ))}
      </div>

      {section === "listings" ? (
        <div className="mt-6 space-y-8">
          {listings.length === 0 ? (
            <EmptyState title="No listings yet" body="Post a car for rent or sale. It can stay a draft until you publish." action={<Link to="/post" className="inline-flex h-12 items-center rounded-full bg-pine px-5 text-sm font-medium text-paper">Post your car</Link>} />
          ) : null}
          {groups.filter((group) => group.items.length).map((group) => (
            <section key={group.key}>
              <h2 className="text-2xl text-ink">{group.label}</h2>
              <ul className="mt-3 divide-y divide-line rounded-3xl border border-line bg-card">
                {group.items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium text-ink">{item.title}</p>
                      <p className="text-sm text-muted">{statusLabel(item.status)} · {item.views} views · {item.whatsappLeads} WhatsApp</p>
                      {item.status === "PENDING_REVIEW" ? <p className="text-sm text-ink-soft">Waiting for an administrator to approve this listing.</p> : null}
                      {item.status === "REJECTED" ? <p className="text-sm text-ink-soft">An administrator rejected this listing. Edit it and submit again.</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {item.status === "DELETED" ? null : <Link to="/post/$id" params={{ id: String(item.id) }} className="rounded-full border border-line px-3 py-2">Edit</Link>}
                      {item.status === "PUBLISHED" ? <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void act(item.id, "pause")}>Pause</button> : null}
                      {item.status === "PAUSED" ? <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void act(item.id, "resume")}>Resume</button> : null}
                      {item.status === "DELETED" ? null : <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void act(item.id, "renew")}>Renew</button>}
                      {item.status !== "DELETED" && item.type === "SALE" ? <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void act(item.id, "sold")}>Mark as sold</button> : null}
                      {item.status !== "DELETED" && item.type === "RENT" ? <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => void act(item.id, "rented")}>Mark as rented</button> : null}
                      {item.status === "DELETED" ? null : (
                        <button
                          type="button"
                          className="rounded-full border border-line px-3 py-2 text-danger"
                          onClick={() => {
                            if (window.confirm("Delete this listing? It will be removed from public search.")) void act(item.id, "delete");
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}

      {section === "saved" ? (
        <div className="mt-6">
          {(data?.saved.length ?? 0) === 0 ? (
            <EmptyState title="No saved cars" body="Tap the heart on a listing to keep it here." action={<Link to="/rent" className="inline-flex h-12 items-center rounded-full bg-pine px-5 text-sm font-medium text-paper">Browse rentals</Link>} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data?.saved.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}
        </div>
      ) : null}

      {section === "leads" ? (
        <div className="mt-6">
          {(data?.leads.length ?? 0) === 0 ? (
            <EmptyState title="No contact activity yet" body="WhatsApp and call taps on your live listings will show up here. This is not an inbox." />
          ) : (
            <ul className="divide-y divide-line rounded-3xl border border-line bg-card">
              {data?.leads.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                  <span className="text-ink">{lead.event === "whatsapp_click" ? "WhatsApp" : lead.event === "phone_click" ? "Call" : "View"} · {lead.title ?? "Listing"}</span>
                  <span className="text-muted">{lead.createdAt?.slice(0, 16).replace("T", " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {section === "profile" && data?.profile ? <ProfileEditor profile={data.profile} email={user.primaryEmail || ""} onSaved={load} /> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-line bg-card p-4">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-2xl tabular-nums text-ink">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}

function ProfileEditor({ profile, email, onSaved }: { profile: Profile; email: string; onSaved: () => void }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [accountType, setAccountType] = useState(profile.company?.accountType || profile.accountType || "individual");
  const [companyName, setCompanyName] = useState(profile.company?.name || "");
  const [salespersonName, setSalespersonName] = useState(profile.company?.salespersonName || "");
  const [phone, setPhone] = useState(profile.phone || profile.company?.phone || "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || profile.company?.whatsapp || "");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mt-6 max-w-xl space-y-4 rounded-3xl border border-line bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        void saveMyProfile({ data: { fullName, phone, whatsapp, accountType, companyName, salespersonName } })
          .then((result) => {
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Profile saved");
            onSaved();
          })
          .catch(() => toast.error("Could not save your profile"))
          .finally(() => setBusy(false));
      }}
    >
      <h2 className="text-2xl text-ink">Profile</h2>
      <dl className="space-y-2 text-sm">
        <Row label="Email" value={profile.email || email || "—"} />
        <Row label="Plan" value={profile.company?.plan || "free"} />
        <Row label="Verified" value={profile.company?.verified ? "Yes, checked by an admin" : "Not verified"} />
      </dl>
      <Field label="Name"><TextInput value={fullName} onChange={(event) => setFullName(event.target.value)} /></Field>
      <Field label="Account type">
        <SelectInput value={accountType} onChange={(event) => setAccountType(event.target.value)}>
          {ACCOUNT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </SelectInput>
      </Field>
      {accountType !== "individual" ? (
        <>
          <Field label="Company name"><TextInput value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></Field>
          <Field label="Salesperson"><TextInput value={salespersonName} onChange={(event) => setSalespersonName(event.target.value)} /></Field>
        </>
      ) : null}
      <Field label="Phone"><TextInput value={phone} onChange={(event) => setPhone(event.target.value)} /></Field>
      <Field label="WhatsApp"><TextInput value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="9715…" /></Field>
      <p className="text-sm text-muted">A verified badge is an admin check. It is not a government licence. Company details are created when you post if you do not have a profile yet.</p>
      <Button type="submit" disabled={busy}>{busy ? "Saving" : "Save profile"}</Button>
    </form>
  );
}
