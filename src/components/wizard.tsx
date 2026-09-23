import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ACCOUNT_TYPES, BODY_TYPES, FUELS, MAKES, MODELS, SPECS, TRANSMISSIONS, YEARS } from "@/lib/catalog";
import { getDirectories, getMyProfile, getOwnedListing, saveMyListing } from "@/lib/marketplace/fns";
import type { Category, ListingDetail, ListingDraft, Place, Profile } from "@/lib/marketplace/types";
import { ListingCard } from "@/components/listing-card";
import { LoadingBlock } from "@/components/states";
import { Button, Field, SelectInput, TextArea, TextInput } from "@/components/ui";
import { toast } from "sonner";

const STEPS = ["Type", "Vehicle", "Price", "Location", "Photos", "Description", "Contact", "Preview"];

type Photo = { url: string; alt: string };

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
  make: "Mercedes-Benz",
  model: "",
  variant: "",
  year: 2024,
  bodyType: "SUV",
  category: "suv",
  transmission: "Automatic",
  fuel: "Petrol",
  engine: "",
  seats: 5,
  color: "",
  mileage: "",
  regionalSpec: "GCC",
  condition: "used",
  areaSlug: "dubai-marina",
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
  airportDelivery: false,
  salePrice: "",
  accidentHistory: "",
  serviceHistory: "",
  warranty: "",
  registrationStatus: "",
  photos: [],
  accountType: "individual",
  fullName: "",
  companyName: "",
  salespersonName: "",
  email: "",
  website: "",
  address: "",
  companyDescription: "",
  logoUrl: "",
};

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
    transmission: listing.transmission,
    fuel: listing.fuel,
    engine: listing.engine,
    seats: listing.seats,
    color: listing.color,
    mileage: String(listing.mileage),
    regionalSpec: listing.regionalSpec,
    condition: listing.condition,
    areaSlug: listing.slugArea,
    pickupLocation: listing.pickupLocation,
    description: listing.description,
    whatsapp: listing.whatsapp,
    phone: listing.phone,
    preferredContact: listing.preferredContact,
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
    deliveryFee: listing.deliveryFee,
    airportDelivery: listing.airportDelivery,
    salePrice: listing.salePrice?.toString() ?? "",
    accidentHistory: listing.accidentHistory,
    serviceHistory: listing.serviceHistory,
    warranty: listing.warranty,
    registrationStatus: listing.registrationStatus,
    photos: listing.images.map((image) => ({ url: image.url, alt: image.alt })),
    accountType: profile?.company?.accountType || profile?.accountType || "individual",
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

export function Wizard({ listingId }: { listingId?: number }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <LoadingBlock label="Loading your account" />;
  if (!user) return <Navigate to="/login" search={{ redirect: listingId ? `/post/${listingId}` : "/post" }} />;
  return <WizardForm listingId={listingId} />;
}

function WizardForm({ listingId }: { listingId?: number }) {
  const { site } = useRouteContext({ from: "__root__" });
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
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
      setPlaces(dirs.places.filter((place) => place.scope === "area"));
      setCategories(dirs.categories);
      if (listing) setForm(fromListing(listing, profile));
      else if (profile) {
        setForm((current) => ({
          ...current,
          accountType: profile.company?.accountType || profile.accountType || "individual",
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
          areaSlug: dirs.places.find((place) => place.slug === "dubai-marina")?.slug ?? current.areaSlug,
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

  const preview = useMemo(() => {
    const place = places.find((item) => item.slug === form.areaSlug);
    const num = (value: string) => (value ? Number(value) : null);
    return {
      id: listingId ?? 0,
      type: form.type,
      status: "DRAFT",
      title: `${form.year} ${form.make} ${form.model}${form.variant ? ` ${form.variant}` : ""}`.trim(),
      slugVehicle: "preview",
      slugArea: form.areaSlug,
      make: form.make,
      model: form.model,
      variant: form.variant,
      year: form.year,
      bodyType: form.bodyType,
      category: form.category,
      categoryName: categories.find((item) => item.slug === form.category)?.name ?? form.category,
      transmission: form.transmission,
      fuel: form.fuel,
      engine: form.engine,
      seats: form.seats,
      color: form.color,
      mileage: Number(form.mileage || 0),
      regionalSpec: form.regionalSpec,
      emirate: place?.emirate ?? "Dubai",
      area: place?.area ?? "Dubai",
      pickupLocation: form.pickupLocation,
      description: form.description,
      whatsapp: form.whatsapp,
      phone: form.phone,
      preferredContact: form.preferredContact,
      isFeatured: false,
      promotionTier: "none",
      views: 0,
      whatsappLeads: 0,
      phoneLeads: 0,
      withDriver: form.withDriver,
      availability: "available",
      condition: form.condition,
      sellerType: form.accountType,
      publishedAt: null,
      expiresAt: null,
      createdAt: "",
      companyId: 0,
      companySlug: "preview",
      companyName: form.accountType === "individual" ? form.fullName : form.companyName,
      companyVerified: false,
      companyLogo: form.logoUrl,
      companyDescription: form.companyDescription,
      companyArea: place?.area ?? "",
      companyEmirate: place?.emirate ?? "",
      companyPlan: "free",
      companyWebsite: form.website,
      isDemo: false,
      dailyPrice: num(form.dailyPrice),
      weeklyPrice: num(form.weeklyPrice),
      monthlyPrice: num(form.monthlyPrice),
      deposit: num(form.deposit),
      minPeriod: form.minPeriod,
      mileageAllowance: form.mileageAllowance,
      extraMileagePrice: form.extraMileagePrice,
      insurance: form.insurance,
      driverRequirements: form.driverRequirements,
      delivery: form.delivery,
      deliveryAvailable: form.deliveryAvailable,
      deliveryScope: form.deliveryScope,
      deliveryAreas: form.deliveryAreas,
      deliveryFee: form.deliveryFee,
      airportDelivery: form.airportDelivery,
      salePrice: num(form.salePrice),
      accidentHistory: form.accidentHistory,
      serviceHistory: form.serviceHistory,
      warranty: form.warranty,
      registrationStatus: form.registrationStatus,
      imageUrl: form.photos[0]?.url ?? "",
      imageAlt: form.photos[0]?.alt ?? "",
    };
  }, [categories, form, listingId, places]);

  const submit = async (intent: "draft" | "publish") => {
    setBusy(true);
    setErrors([]);
    const num = (value: string) => (value === "" ? null : Number(value));
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
      transmission: form.transmission,
      fuel: form.fuel,
      engine: form.engine,
      seats: form.seats,
      color: form.color,
      mileage: Number(form.mileage || 0),
      regionalSpec: form.regionalSpec,
      condition: form.condition,
      emirate: "",
      areaSlug: form.areaSlug,
      pickupLocation: form.pickupLocation,
      description: form.description,
      whatsapp: form.whatsapp,
      phone: form.phone,
      preferredContact: form.preferredContact,
      withDriver: form.withDriver,
      dailyPrice: num(form.dailyPrice),
      weeklyPrice: num(form.weeklyPrice),
      monthlyPrice: num(form.monthlyPrice),
      deposit: num(form.deposit),
      minPeriod: form.minPeriod,
      mileageAllowance: form.mileageAllowance,
      extraMileagePrice: form.extraMileagePrice,
      insurance: form.insurance,
      driverRequirements: form.driverRequirements,
      delivery: form.delivery,
      deliveryAvailable: form.deliveryAvailable,
      deliveryScope: form.deliveryScope,
      deliveryAreas: form.deliveryAreas,
      deliveryFee: form.deliveryFee,
      airportDelivery: form.airportDelivery,
      salePrice: num(form.salePrice),
      accidentHistory: form.accidentHistory,
      serviceHistory: form.serviceHistory,
      warranty: form.warranty,
      registrationStatus: form.registrationStatus,
      photos: form.photos,
      advertiser: {
        accountType: form.accountType,
        fullName: form.fullName,
        companyName: form.companyName,
        salespersonName: form.salespersonName,
        email: form.email,
        phone: form.phone,
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
      <h1 className="mt-2 text-4xl text-ink">{STEPS[step]}</h1>
      <ol className="mt-4 flex gap-1" aria-label="Progress">
        {STEPS.map((label, index) => (
          <li key={label} className="flex-1">
            <button type="button" onClick={() => setStep(index)} className={`h-1.5 w-full rounded-full ${index <= step ? "bg-pine" : "bg-sand"}`} aria-label={label} />
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm text-muted">Step {step + 1} of {STEPS.length}</p>

      <div className="mt-6 space-y-4">
        {step === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => patch({ type: "RENT" })} className={`rounded-3xl border p-5 text-left ${form.type === "RENT" ? "border-pine bg-foam" : "border-line bg-card"}`}>
              <span className="text-2xl text-ink">Rent</span>
              <p className="mt-1 text-sm text-ink-soft">Daily, weekly or monthly hire.</p>
            </button>
            <button type="button" onClick={() => patch({ type: "SALE" })} className={`rounded-3xl border p-5 text-left ${form.type === "SALE" ? "border-pine bg-foam" : "border-line bg-card"}`}>
              <span className="text-2xl text-ink">Sell</span>
              <p className="mt-1 text-sm text-ink-soft">A car offered for sale.</p>
            </button>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Make">
              <SelectInput value={form.make} onChange={(event) => patch({ make: event.target.value, model: "" })}>
                {MAKES.map((make) => <option key={make}>{make}</option>)}
              </SelectInput>
            </Field>
            <Field label="Model">
              <TextInput value={form.model} list="model-list" onChange={(event) => patch({ model: event.target.value })} placeholder="G-Class" />
              <datalist id="model-list">{models.map((model) => <option key={model} value={model} />)}</datalist>
            </Field>
            <Field label="Variant">
              <TextInput value={form.variant} onChange={(event) => patch({ variant: event.target.value })} placeholder="G 63" />
            </Field>
            <Field label="Year">
              <SelectInput value={form.year} onChange={(event) => patch({ year: Number(event.target.value) })}>
                {YEARS.map((year) => <option key={year}>{year}</option>)}
              </SelectInput>
            </Field>
            <Field label="Body">
              <SelectInput value={form.bodyType} onChange={(event) => patch({ bodyType: event.target.value })}>
                {BODY_TYPES.map((item) => <option key={item}>{item}</option>)}
              </SelectInput>
            </Field>
            <Field label="Category">
              <SelectInput value={form.category} onChange={(event) => patch({ category: event.target.value })}>
                {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
              </SelectInput>
            </Field>
            <Field label="Transmission">
              <SelectInput value={form.transmission} onChange={(event) => patch({ transmission: event.target.value })}>
                {TRANSMISSIONS.map((item) => <option key={item}>{item}</option>)}
              </SelectInput>
            </Field>
            <Field label="Fuel">
              <SelectInput value={form.fuel} onChange={(event) => patch({ fuel: event.target.value })}>
                {FUELS.map((item) => <option key={item}>{item}</option>)}
              </SelectInput>
            </Field>
            <Field label="Engine">
              <TextInput value={form.engine} onChange={(event) => patch({ engine: event.target.value })} placeholder="3.0L" />
            </Field>
            <Field label="Seats">
              <SelectInput value={form.seats} onChange={(event) => patch({ seats: Number(event.target.value) })}>
                {[2, 4, 5, 7, 8].map((n) => <option key={n}>{n}</option>)}
              </SelectInput>
            </Field>
            <Field label="Colour">
              <TextInput value={form.color} onChange={(event) => patch({ color: event.target.value })} />
            </Field>
            <Field label="Mileage (km)">
              <TextInput inputMode="numeric" value={form.mileage} onChange={(event) => patch({ mileage: event.target.value.replace(/[^\d]/g, "") })} />
            </Field>
            <Field label="Regional specification">
              <SelectInput value={form.regionalSpec} onChange={(event) => patch({ regionalSpec: event.target.value })}>
                {SPECS.map((item) => <option key={item}>{item}</option>)}
              </SelectInput>
            </Field>
            {form.type === "SALE" ? (
              <Field label="New or used">
                <SelectInput value={form.condition} onChange={(event) => patch({ condition: event.target.value })}>
                  <option value="used">Used</option>
                  <option value="new">New</option>
                </SelectInput>
              </Field>
            ) : null}
          </div>
        ) : null}

        {step === 2 && form.type === "RENT" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Daily price (AED)"><TextInput inputMode="numeric" value={form.dailyPrice} onChange={(event) => patch({ dailyPrice: event.target.value.replace(/[^\d]/g, "") })} /></Field>
            <Field label="Weekly price (AED)"><TextInput inputMode="numeric" value={form.weeklyPrice} onChange={(event) => patch({ weeklyPrice: event.target.value.replace(/[^\d]/g, "") })} /></Field>
            <Field label="Monthly price (AED)"><TextInput inputMode="numeric" value={form.monthlyPrice} onChange={(event) => patch({ monthlyPrice: event.target.value.replace(/[^\d]/g, "") })} /></Field>
            <Field label="Security deposit (AED)"><TextInput inputMode="numeric" value={form.deposit} onChange={(event) => patch({ deposit: event.target.value.replace(/[^\d]/g, "") })} /></Field>
            <Field label="Minimum rental period"><TextInput value={form.minPeriod} onChange={(event) => patch({ minPeriod: event.target.value })} placeholder="1 day" /></Field>
            <Field label="Mileage allowance"><TextInput value={form.mileageAllowance} onChange={(event) => patch({ mileageAllowance: event.target.value })} placeholder="250 km/day" /></Field>
            <Field label="Extra mileage price"><TextInput value={form.extraMileagePrice} onChange={(event) => patch({ extraMileagePrice: event.target.value })} /></Field>
            <Field label="Insurance"><TextInput value={form.insurance} onChange={(event) => patch({ insurance: event.target.value })} /></Field>
            <Field label="Driver requirements"><TextInput value={form.driverRequirements} onChange={(event) => patch({ driverRequirements: event.target.value })} /></Field>
            <Field label="Delivery or pickup"><TextInput value={form.delivery} onChange={(event) => patch({ delivery: event.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.withDriver} onChange={(event) => patch({ withDriver: event.target.checked })} />
              With driver available
            </label>
          </div>
        ) : null}

        {step === 2 && form.type === "SALE" ? (
          <div className="grid gap-4">
            <Field label="Sale price (AED)"><TextInput inputMode="numeric" value={form.salePrice} onChange={(event) => patch({ salePrice: event.target.value.replace(/[^\d]/g, "") })} /></Field>
            <Field label="Accident history"><TextArea value={form.accidentHistory} onChange={(event) => patch({ accidentHistory: event.target.value })} placeholder="What should a buyer verify?" /></Field>
            <Field label="Service history"><TextArea value={form.serviceHistory} onChange={(event) => patch({ serviceHistory: event.target.value })} /></Field>
            <Field label="Warranty"><TextInput value={form.warranty} onChange={(event) => patch({ warranty: event.target.value })} /></Field>
            <Field label="Registration status"><TextInput value={form.registrationStatus} onChange={(event) => patch({ registrationStatus: event.target.value })} /></Field>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4">
            <Field label="Area">
              <SelectInput value={form.areaSlug} onChange={(event) => patch({ areaSlug: event.target.value })}>
                {Array.from(places.reduce((map, place) => {
                  const list = map.get(place.emirate) ?? [];
                  list.push(place);
                  map.set(place.emirate, list);
                  return map;
                }, new Map<string, typeof places>())).map(([emirate, items]) => (
                  <optgroup key={emirate} label={emirate}>
                    {items.map((place) => <option key={place.slug} value={place.slug}>{place.area}</option>)}
                  </optgroup>
                ))}
              </SelectInput>
            </Field>
            <Field label="Pickup location" hint="Where the customer collects the car. Do not publish a private home address if you would rather meet in public.">
              <TextInput value={form.pickupLocation} onChange={(event) => patch({ pickupLocation: event.target.value })} />
            </Field>
            {form.type === "RENT" ? (
              <div className="grid gap-4 rounded-3xl border border-line p-4">
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" checked={form.deliveryAvailable} onChange={(event) => patch({ deliveryAvailable: event.target.checked, deliveryScope: event.target.checked ? form.deliveryScope || "areas" : "" })} />
                  Delivery available
                </label>
                {form.deliveryAvailable ? (
                  <>
                    <Field label="Delivery coverage">
                      <SelectInput value={form.deliveryScope || "areas"} onChange={(event) => patch({ deliveryScope: event.target.value })}>
                        <option value="areas">Selected areas</option>
                        <option value="dubai">Dubai-wide</option>
                      </SelectInput>
                    </Field>
                    {form.deliveryScope !== "dubai" ? (
                      <Field label="Delivery areas" hint="Only the areas you actually cover.">
                        <TextInput value={form.deliveryAreas} onChange={(event) => patch({ deliveryAreas: event.target.value })} placeholder="Dubai Marina, JLT" />
                      </Field>
                    ) : null}
                    <Field label="Delivery fee"><TextInput value={form.deliveryFee} onChange={(event) => patch({ deliveryFee: event.target.value })} placeholder="AED 150, or included" /></Field>
                    <label className="flex items-center gap-2 text-sm text-ink">
                      <input type="checkbox" checked={form.airportDelivery} onChange={(event) => patch({ airportDelivery: event.target.checked })} />
                      Airport delivery
                    </label>
                    <Field label="Delivery notes"><TextInput value={form.delivery} onChange={(event) => patch({ delivery: event.target.value })} /></Field>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div>
            <Field label="Photos" hint="Front, rear, side, interior and dashboard. JPG, PNG or WebP. The first photo is the cover.">
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
                      patch({
                        photos: [...form.photos, ...urls.map((url) => ({ url, alt: `${form.make} ${form.model}`.trim() }))].slice(0, 8),
                      });
                    })
                    .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Upload failed"))
                    .finally(() => setUploading(false));
                }}
              />
            </Field>
            {uploading ? <p className="mt-3 text-sm text-muted">Preparing photos…</p> : null}
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {form.photos.map((photo, index) => (
                <li key={photo.url.slice(0, 48) + index} className="overflow-hidden rounded-2xl border border-line bg-card">
                  <img src={photo.url} alt={photo.alt} className="aspect-photo w-full object-cover" />
                  <div className="flex gap-1 p-2 text-xs">
                    <button type="button" disabled={index === 0} onClick={() => {
                      const photos = [...form.photos];
                      const [item] = photos.splice(index, 1);
                      if (item) photos.unshift(item);
                      patch({ photos });
                    }}>Cover</button>
                    <button type="button" onClick={() => patch({ photos: form.photos.filter((_, i) => i !== index) })}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {step === 5 ? (
          <Field label="Description" hint="Describe the vehicle, rental conditions, features, mileage allowance, deposit and anything customers should know.">
            <TextArea rows={8} value={form.description} onChange={(event) => patch({ description: event.target.value })} placeholder="Describe the vehicle, rental conditions, features, mileage allowance, deposit and anything customers should know." />
          </Field>
        ) : null}

        {step === 6 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Account type">
              <SelectInput value={form.accountType} onChange={(event) => patch({ accountType: event.target.value })}>
                {ACCOUNT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Your name"><TextInput value={form.fullName} onChange={(event) => patch({ fullName: event.target.value })} /></Field>
            {form.accountType !== "individual" ? (
              <Field label="Company name"><TextInput value={form.companyName} onChange={(event) => patch({ companyName: event.target.value })} /></Field>
            ) : null}
            <Field label="Sales person"><TextInput value={form.salespersonName} onChange={(event) => patch({ salespersonName: event.target.value })} /></Field>
            <Field label="Email"><TextInput type="email" value={form.email} onChange={(event) => patch({ email: event.target.value })} /></Field>
            <Field label="WhatsApp" hint="Include the country code, for example 9715…"><TextInput value={form.whatsapp} onChange={(event) => patch({ whatsapp: event.target.value })} /></Field>
            <Field label="Phone"><TextInput value={form.phone} onChange={(event) => patch({ phone: event.target.value })} /></Field>
            <Field label="Preferred contact">
              <SelectInput value={form.preferredContact} onChange={(event) => patch({ preferredContact: event.target.value })}>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone</option>
              </SelectInput>
            </Field>
            <Field label="Website"><TextInput value={form.website} onChange={(event) => patch({ website: event.target.value })} /></Field>
            <Field label="Address"><TextInput value={form.address} onChange={(event) => patch({ address: event.target.value })} /></Field>
            <div className="sm:col-span-2">
              <Field label="About the advertiser"><TextArea value={form.companyDescription} onChange={(event) => patch({ companyDescription: event.target.value })} /></Field>
            </div>
          </div>
        ) : null}

        {step === 7 ? (
          <div>
            <p className="mb-4 text-sm text-ink-soft">
              {site.moderation === "manual"
                ? "New listings and edits are reviewed before they go live."
                : "Listings publish immediately with the current site setting."}
            </p>
            <div className="max-w-sm">
              <ListingCard listing={preview} />
            </div>
            {errors.length ? (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-danger">
                {errors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="line" disabled={busy} onClick={() => void submit("draft")}>Save draft</Button>
              <Button disabled={busy} onClick={() => void submit("publish")}>{busy ? "Saving…" : "Publish listing"}</Button>
            </div>
          </div>
        ) : null}
      </div>

      {step < 7 ? (
        <div className="mt-8 flex justify-between">
          <Button variant="line" disabled={step === 0} onClick={() => setStep((n) => Math.max(0, n - 1))}>Back</Button>
          <Button onClick={() => setStep((n) => Math.min(7, n + 1))}>Continue</Button>
        </div>
      ) : null}
    </div>
  );
}
