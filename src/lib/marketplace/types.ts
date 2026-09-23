export type Listing = {
  id: number;
  type: "RENT" | "SALE";
  status: string;
  title: string;
  slugVehicle: string;
  slugArea: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  bodyType: string;
  category: string;
  categoryName: string;
  transmission: string;
  fuel: string;
  engine: string;
  seats: number;
  color: string;
  mileage: number;
  regionalSpec: string;
  emirate: string;
  area: string;
  pickupLocation: string;
  description: string;
  whatsapp: string;
  phone: string;
  preferredContact: string;
  isFeatured: boolean;
  promotionTier: string;
  views: number;
  whatsappLeads: number;
  phoneLeads: number;
  withDriver: boolean;
  availability: string;
  condition: string;
  sellerType: string;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  companyId: number;
  companySlug: string;
  companyName: string;
  companyVerified: boolean;
  companyLogo: string;
  companyDescription: string;
  companyArea: string;
  companyEmirate: string;
  companyPlan: string;
  companyWebsite: string;
  isDemo: boolean;
  dailyPrice: number | null;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  deposit: number | null;
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
  salePrice: number | null;
  accidentHistory: string;
  serviceHistory: string;
  warranty: string;
  registrationStatus: string;
  imageUrl: string;
  imageAlt: string;
};

export type ListingImage = {
  id: number;
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type ListingDetail = Listing & { images: ListingImage[] };

export type Facet = { name: string; n: number; slug?: string };

export type Facets = {
  makes: Facet[];
  categories: Facet[];
  areas: Facet[];
  fuels: Facet[];
  transmissions: Facet[];
};

export type SearchResult = {
  items: Listing[];
  total: number;
  page: number;
  pages: number;
  facets: Facets;
};

export type Place = {
  id: number;
  emirate: string;
  area: string;
  slug: string;
  scope: "emirate" | "area";
  popular: boolean;
  sortOrder: number;
  parentSlug: string;
  active: boolean;
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  kind: string;
  sortOrder: number;
};

export type CompanyPublic = {
  id: number;
  slug: string;
  name: string;
  salespersonName: string;
  accountType: string;
  description: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  website: string;
  address: string;
  emirate: string;
  area: string;
  verified: boolean;
  plan: string;
  isDemo: boolean;
  verificationNote: string;
};

export type OwnedCompany = CompanyPublic & {
  email: string;
  socialInstagram: string;
};

export type Profile = {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  role: string;
  accountType: string;
  suspended: boolean;
  company: OwnedCompany | null;
};

export type PhotoInput = { url: string; alt: string };

export type ListingDraft = {
  id?: number;
  intent: "draft" | "publish";
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
  mileage: number;
  regionalSpec: string;
  condition: string;
  emirate: string;
  areaSlug: string;
  pickupLocation: string;
  description: string;
  whatsapp: string;
  phone: string;
  preferredContact: string;
  withDriver: boolean;
  dailyPrice: number | null;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  deposit: number | null;
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
  salePrice: number | null;
  accidentHistory: string;
  serviceHistory: string;
  warranty: string;
  registrationStatus: string;
  photos: PhotoInput[];
  advertiser: {
    accountType: string;
    fullName: string;
    companyName: string;
    salespersonName: string;
    email: string;
    phone: string;
    whatsapp: string;
    website: string;
    address: string;
    description: string;
    logoUrl: string;
    emirate: string;
    area: string;
  };
};

export type HomePayload = {
  rent: Listing[];
  sale: Listing[];
  total: number;
  rentCount: number;
  saleCount: number;
  places: Place[];
  categories: Category[];
};
