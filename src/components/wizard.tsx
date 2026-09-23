import { useEffect, useState } from "react";
import { Navigate, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ACCOUNT_TYPES, BODY_TYPES, MAKES, MODELS, YEARS } from "@/lib/catalog";
import { getDirectories, getMyProfile, getOwnedListing, saveMyListing } from "@/lib/marketplace/fns";
import type { Category, ListingDetail, ListingDraft, Place, Profile } from "@/lib/marketplace/types";
import { LoadingBlock } from "@/components/states";
import { Button, Field, SelectInput, TextInput } from "@/components/ui";
import { toast } from "sonner";

type Photo = { url: string; alt: string };
type DeliveryMode = "free" | "charge" | "none";

const ADVERTISER_TYPES = [
  ACCOUNT_TYPES.find((item) => item.value === "dealer")!,
  ACCOUNT_TYPES.find((item) => item.value === "rental_company")!,
  { value: "business", label: "Company" },
  ACCOUNT_TYPES.find((item) => item.value === "individual")!,
];

type FormState = {
  type: "RENT" | "SALE";
  make: string;
  model: string;
  variant: string;
  year: number;
  bodyType: string;
  category: string;
  transmission: string;
  fuel: string;
  engine: string;
  seats: number;
  color: string;
  mileage: string;
  regionalSpec: string;
  condition: string;
  areaSlug: string;
  pickupLocation: string;
  description: string;
  whatsapp: string;
  phone: string;
  preferredContact: string;
  withDriver: boolean;
  dailyPrice: string;
  weeklyPrice: string;
  monthlyPrice: string;
  deposit: string;
  minPeriod: string;
  mileageAllowance: string;
  extraMileagePrice: string;
  insurance: string;
  driverRequirements: string;
  delivery: string;
  deliveryAvailable: boolean;
  deliveryScope: string;
  deliveryAreas: string;
  deliveryFee: string;
  deliveryMode: DeliveryMode;
  airportDelivery: boolean;
  salePrice: string;
  accidentHistory: string;
  serviceHistory: string;
  warranty: string;
  registrationStatus: string;
  photos: Photo[];
  accountType: string;
  fullName: string;
  companyName: string;
  salespersonName: string;
  email: string;
  website: string;
  address: string;
  companyDescription: string;
  logoUrl: string;
};

const blank: FormState = {
  type: "RENT",
  make: "BMW",
  model: "",
  variant: "",
  year: 2024,
  bodyType: "Sedan",
  category: "sedan",
  transmission: "Automatic",
  fuel: "Petrol",
  engine: "",
  seats: 5,
  color: "",
  mileage: "0",
  regionalSpec: "GCC",
  condition: "used",
  areaSlug: "dubai",
  pickupLocation: "",
  description: "",
  whatsapp: "",
  phone: "",
  preferredContact: "whatsapp",
  withDriver: false,
  dailyPrice: "",
  weeklyPrice: "",
  monthlyPrice: "",
  deposit: "",
  minPeriod: "",
  mileageAllowance: "",
  extraMileagePrice: "",
  insurance: "",
  driverRequirements: "",
  delivery: "",
  deliveryAvailable: false,
  deliveryScope: "",
  deliveryAreas: "",
  deliveryFee: "",
  deliveryMode: "free",
  airportDelivery: false,
  salePrice: "",
  accidentHistory: "",
  serviceHistory: "",
  warranty: "",
  registrationStatus: "",
  photos: [],
  accountType: "dealer",
  fullName: "",
  companyName: "",
  salespersonName: "",
  email: "",
  website: "",
  address: "",
  companyDescription: "",
  logoUrl: "",
};

function deliveryModeFrom(listing: ListingDetail): DeliveryMode {
  const text = `${listing.deliveryFee} ${listing.delivery}`.toLowerCase();
  if (!listing.deliveryAvailable && !text.trim()) return "none";
  if (text.includes("free") || text.includes("included")) return "free";
  if (listing.deliveryAvailable || /\d/.test(text)) return "charge";
  return "none";
}

function fromListing(listing: ListingDetail, profile: Profile | null): FormState {
  return {
    ...blank,
    type: listing.type,
    make: listing.make,
    model: listing.model,
    variant: listing.variant,
    year: listing.year,
    bodyType: listing.bodyType,
    category: listing.category,
    transmission: listing.transmission || "Automatic",
    fuel: listing.fuel || "Petrol",
    engine: listing.engine,
    seats: listing.seats || 5,
    color: listing.color,
    mileage: String(listing.mileage ?? 0),
    regionalSpec: listing.regionalSpec,
    condition: listing.condition,
    areaSlug: listing.slugArea,
    pickupLocation: listing.pickupLocation,
    description: listing.description,
    whatsapp: listing.whatsapp,
    phone: listing.phone,
    preferredContact: "whatsapp",
    withDriver: listing.withDriver,
    dailyPrice: listing.dailyPrice?.toString() ?? "",
    weeklyPrice: listing.weeklyPrice?.toString() ?? "",
    monthlyPrice: listing.monthlyPrice?.toString() ?? "",
    deposit: listing.deposit?.toString() ?? "",
    minPeriod: listing.minPeriod,
    mileageAllowance: listing.mileageAllowance,
    extraMileagePrice: listing.extraMileagePrice,
    insurance: listing.insurance,
    driverRequirements: listing.driverRequirements,
    delivery: listing.delivery,
    deliveryAvailable: listing.deliveryAvailable,
    deliveryScope: listing.deliveryScope,
    deliveryAreas: listing.deliveryAreas,
    deliveryFee: String(listing.deliveryFee ?? "").match(/\d[\d,]*/)?.[0]?.replace(/,/g, "") ?? "",
    deliveryMode: deliveryModeFrom(listing),
    airportDelivery: listing.airportDelivery,
    salePrice: listing.salePrice?.toString() ?? "",
    accidentHistory: listing.accidentHistory,
    serviceHistory: listing.serviceHistory,
    warranty: listing.warranty,
    registrationStatus: listing.registrationStatus,
    photos: listing.images.map((image) => ({ url: image.url, alt: image.alt })),
    accountType: profile?.company?.accountType || profile?.accountType || "dealer",
    fullName: profile?.fullName ?? "",
    companyName: profile?.company?.name ?? "",
    salespersonName: profile?.company?.salespersonName ?? "",
    email: profile?.company?.email || profile?.email || "",
    website: profile?.company?.website ?? "",
    address: profile?.company?.address ?? "",
    companyDescription: profile?.company?.description ?? "",
    logoUrl: profile?.company?.logoUrl ?? "",
  };
}

async function compress(file: File) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Use a JPG, PNG, or WebP photo.");
  if (file.size > 12_000_000) throw new Error("That photo is larger than 12 MB.");
  const blobUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read that photo."));
      el.src = blobUrl;
    });
    const max = 1400;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not read that photo.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

function money(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits).toLocaleString("en-AE") : "";
}

function summary(form: FormState) {
  if (form.description.trim()) return form.description;
  const name = [form.year, form.make, form.model].filter(Boolean).join(" ");
  const bits = [name];
  if (form.bodyType) bits.push(form.bodyType);
  if (form.type === "RENT") {
    if (form.dailyPrice) bits.push(`Daily AED ${money(form.dailyPrice)}`);
    if (form.weeklyPrice) bits.push(`Weekly AED ${money(form.weeklyPrice)}`);
  } else if (form.salePrice) {
    bits.push(`AED ${money(form.salePrice)}`);
  }
  if (form.deliveryMode === "free") bits.push("Delivery free");
  if (form.deliveryMode === "charge" && form.deliveryFee) bits.push(`Delivery AED ${money(form.deliveryFee)}`);
  return bits.filter(Boolean).join(". ");
}

export function Wizard({ listingId }: { listingId?: number }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <LoadingBlock label="Loading your account" />;
  if (!user) return <Navigate to="/login" search={{ redirect: listingId ? `/post/${listingId}` : "/post" }} />;
  return <WizardForm listingId={listingId} />;
}

function WizardForm({ listingId }: { listingId?: number }) {
  const { site } = useRouteContext({ from: "__root__" });
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(blank);
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      const [dirs, profile, listing] = await Promise.all([
        getDirectories(),
        getMyProfile(),
        listingId ? getOwnedListing({ data: { id: listingId } }) : Promise.resolve(null),
      ]);
      if (cancel) return;
      setPlaces(dirs.places.filter((place) => place.scope === "area" || place.slug === "dubai"));
      setCategories(dirs.categories);
      if (listing) setForm(fromListing(listing, profile));
      else if (profile) {
        setForm((current) => ({
          ...current,
          accountType: profile.company?.accountType || profile.accountType || "dealer",
          fullName: profile.fullName,
          companyName: profile.accountType === "individual" ? "" : profile.company?.name ?? "",
          salespersonName: profile.company?.salespersonName ?? "",
          email: profile.company?.email || profile.email,
          whatsapp: profile.whatsapp || profile.company?.whatsapp || "",
          phone: profile.phone || profile.company?.phone || "",
          website: profile.company?.website ?? "",
          address: profile.company?.address ?? "",
          companyDescription: profile.company?.description ?? "",
          logoUrl: profile.company?.logoUrl ?? "",
          areaSlug: dirs.places.find((place) => place.slug === "dubai")?.slug ?? current.areaSlug,
        }));
      }
      setReady(true);
    })().catch(() => setReady(true));
    return () => {
      cancel = true;
    };
  }, [listingId]);

  const patch = (partial: Partial<FormState>) => setForm((current) => ({ ...current, ...partial }));
  const models = MODELS[form.make] ?? [];
  const digitsOnly = (value: string) => value.replace(/[^\d]/g, "");

  const submit = async (intent: "draft" | "publish") => {
    setBusy(true);
    setErrors([]);
    const num = (value: string) => (value === "" ? null : Number(value));
    const fee = form.deliveryMode === "charge" ? digitsOnly(form.deliveryFee) : "";
    const deliveryAvailable = form.type === "RENT" && form.deliveryMode !== "none";
    const deliveryFee = form.deliveryMode === "free" ? "Free" : fee ? `AED ${fee}` : "";
    const delivery = form.deliveryMode === "free" ? "Free delivery" : fee ? `Delivery AED ${fee}` : "";
    const advertiserName = form.accountType === "individual" ? form.fullName : form.companyName || form.fullName;
    const payload: ListingDraft = {
      id: listingId,
      intent,
      type: form.type,
      make: form.make,
      model: form.model,
      variant: form.variant,
      year: form.year,
      bodyType: form.bodyType,
      category: form.category,
      transmission: form.transmission || "Automatic",
      fuel: form.fuel || "Petrol",
      engine: form.engine,
      seats: form.seats || 5,
      color: form.color,
      mileage: Number(form.mileage || 0),
      regionalSpec: form.regionalSpec,
      condition: form.condition,
      emirate: "",
      areaSlug: form.areaSlug,
      pickupLocation: form.pickupLocation,
      description: summary(form),
      whatsapp: form.whatsapp,
      phone: form.whatsapp || form.phone,
      preferredContact: "whatsapp",
      withDriver: form.withDriver,
      dailyPrice: form.type === "RENT" ? num(form.dailyPrice) : null,
      weeklyPrice: form.type === "RENT" ? num(form.weeklyPrice) : null,
      monthlyPrice: form.type === "RENT" ? num(form.monthlyPrice) : null,
      deposit: num(form.deposit),
      minPeriod: form.minPeriod,
      mileageAllowance: form.mileageAllowance,
      extraMileagePrice: form.extraMileagePrice,
      insurance: form.insurance,
      driverRequirements: form.driverRequirements,
      delivery: form.type === "RENT" ? delivery : "",
      deliveryAvailable,
      deliveryScope: deliveryAvailable ? "dubai" : "",
      deliveryAreas: "",
      deliveryFee: form.type === "RENT" ? deliveryFee : "",
      airportDelivery: false,
      salePrice: form.type === "SALE" ? num(form.salePrice) : null,
      accidentHistory: form.accidentHistory,
      serviceHistory: form.serviceHistory,
      warranty: form.warranty,
      registrationStatus: form.registrationStatus,
      photos: form.photos,
      advertiser: {
        accountType: form.accountType,
        fullName: form.fullName || advertiserName,
        companyName: form.accountType === "individual" ? "" : advertiserName,
        salespersonName: form.salespersonName,
        email: form.email,
        phone: form.whatsapp || form.phone,
        whatsapp: form.whatsapp,
        website: form.website,
        address: form.address,
        description: form.companyDescription,
        logoUrl: form.logoUrl,
        emirate: "",
        area: "",
      },
    };
    try {
      const result = await saveMyListing({ data: payload });
      if (!result.ok) {
        setErrors(result.errors);
        setBusy(false);
        return;
      }
      toast.success(result.status === "PUBLISHED" ? "Listing is live" : result.status === "PENDING_REVIEW" ? "Sent for review" : "Draft saved");
      await navigate({ to: "/account", search: { section: "listings" } });
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Could not save the listing."]);
      setBusy(false);
    }
  };

  if (!ready) return <LoadingBlock label="Preparing the form" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <p className="text-xs font-medium uppercase tracking-widest text-pine">Post your car</p>
      <h1 className="mt-2 text-4xl text-ink">New listing</h1>
      <p className="mt-2 text-sm text-ink-soft">Only the details a customer needs. One page.</p>

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => patch({ type: "RENT" })} className={`rounded-3xl border p-4 text-left ${form.type === "RENT" ? "border-pine bg-foam" : "border-line bg-card"}`}>
            <span className="text-xl text-ink">Rent</span>
          </button>
          <button type="button" onClick={() => patch({ type: "SALE" })} className={`rounded-3xl border p-4 text-left ${form.type === "SALE" ? "border-pine bg-foam" : "border-line bg-card"}`}>
            <span className="text-xl text-ink">Sell</span>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Make">
            <SelectInput value={form.make} onChange={(event) => patch({ make: event.target.value, model: "" })}>
              {MAKES.map((make) => <option key={make}>{make}</option>)}
            </SelectInput>
          </Field>
          <Field label="Model">
            <TextInput value={form.model} list="model-list" onChange={(event) => patch({ model: event.target.value })} placeholder="735" />
            <datalist id="model-list">{models.map((model) => <option key={model} value={model} />)}</datalist>
          </Field>
          <Field label="Year">
            <SelectInput value={form.year} onChange={(event) => patch({ year: Number(event.target.value) })}>
              {YEARS.map((year) => <option key={year}>{year}</option>)}
            </SelectInput>
          </Field>
          <Field label="Category">
            <SelectInput value={form.category} onChange={(event) => patch({ category: event.target.value })}>
              {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Body">
            <SelectInput value={form.bodyType} onChange={(event) => patch({ bodyType: event.target.value })}>
              {BODY_TYPES.map((item) => <option key={item}>{item}</option>)}
            </SelectInput>
          </Field>
          <Field label="Area">
            <SelectInput value={form.areaSlug} onChange={(event) => patch({ areaSlug: event.target.value })}>
              {places.map((place) => <option key={place.slug} value={place.slug}>{place.area}</option>)}
            </SelectInput>
          </Field>
        </div>

        {form.type === "RENT" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Daily price (AED)">
              <TextInput inputMode="numeric" value={form.dailyPrice} onChange={(event) => patch({ dailyPrice: digitsOnly(event.target.value) })} placeholder="1000" />
            </Field>
            <Field label="Weekly price (AED)">
              <TextInput inputMode="numeric" value={form.weeklyPrice} onChange={(event) => patch({ weeklyPrice: digitsOnly(event.target.value) })} placeholder="5000" />
            </Field>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-ink">Delivery</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([
                  ["free", "Free"],
                  ["charge", "Charges"],
                  ["none", "No delivery"],
                ] as const).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => patch({ deliveryMode: value })} className={`h-12 rounded-2xl border text-sm ${form.deliveryMode === value ? "border-pine bg-foam text-ink" : "border-line bg-card text-ink-soft"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {form.deliveryMode === "charge" ? (
              <Field label="Delivery charge (AED)">
                <TextInput inputMode="numeric" value={form.deliveryFee} onChange={(event) => patch({ deliveryFee: digitsOnly(event.target.value) })} placeholder="100" />
              </Field>
            ) : null}
          </div>
        ) : (
          <Field label="Sale price (AED)">
            <TextInput inputMode="numeric" value={form.salePrice} onChange={(event) => patch({ salePrice: digitsOnly(event.target.value) })} placeholder="150000" />
          </Field>
        )}

        <div>
          <Field label="Car photos" hint="A few photos are enough. The first one is the cover. JPG, PNG or WebP.">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="mt-2 block w-full text-sm"
              onChange={(event) => {
                const files = [...(event.target.files ?? [])];
                event.target.value = "";
                if (!files.length) return;
                setUploading(true);
                void Promise.all(files.map((file) => compress(file)))
                  .then((urls) => {
                    setForm((current) => ({
                      ...current,
                      photos: [...current.photos, ...urls.map((url) => ({ url, alt: `${current.make} ${current.model}`.trim() }))].slice(0, 8),
                    }));
                  })
                  .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Upload failed"))
                  .finally(() => setUploading(false));
              }}
            />
          </Field>
          {uploading ? <p className="mt-3 text-sm text-muted">Preparing photos…</p> : null}
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {form.photos.map((photo, index) => (
              <li key={photo.url.slice(0, 48) + index} className="overflow-hidden rounded-2xl border border-line bg-card">
                <img src={photo.url} alt={photo.alt} className="aspect-photo w-full object-cover" />
                <button type="button" className="w-full px-2 py-2 text-xs text-ink" onClick={() => patch({ photos: form.photos.filter((_, i) => i !== index) })}>Remove</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Account type">
            <SelectInput value={form.accountType} onChange={(event) => patch({ accountType: event.target.value })}>
              {ADVERTISER_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </SelectInput>
          </Field>
          {form.accountType === "individual" ? (
            <Field label="Your name">
              <TextInput value={form.fullName} onChange={(event) => patch({ fullName: event.target.value })} />
            </Field>
          ) : (
            <Field label="Dealer or company name">
              <TextInput value={form.companyName} onChange={(event) => patch({ companyName: event.target.value })} />
            </Field>
          )}
          <Field label="WhatsApp" hint="Country code, for example 9715…">
            <TextInput value={form.whatsapp} onChange={(event) => patch({ whatsapp: event.target.value })} placeholder="971501234567" />
          </Field>
        </div>

        {errors.length ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-danger">
            {errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        ) : null}

        <p className="text-sm text-ink-soft">
          {site.moderation === "manual" ? "New listings are reviewed before they go live." : "Listings publish immediately."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="line" disabled={busy} onClick={() => void submit("draft")}>Save draft</Button>
          <Button disabled={busy} onClick={() => void submit("publish")}>{busy ? "Saving…" : "Publish listing"}</Button>
        </div>
      </div>
    </div>
  );
}
