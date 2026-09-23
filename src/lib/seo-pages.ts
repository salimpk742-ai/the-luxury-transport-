export type SeoIntent = {
  slug: string;
  type: "RENT" | "SALE";
  title: string;
  description: string;
  h1: string;
  category?: string;
  make?: string;
  condition?: string;
};

export const SEO_INTENTS: SeoIntent[] = [
  {
    slug: "car-rental",
    type: "RENT",
    title: "Car rental in Dubai",
    h1: "Car rental in Dubai",
    description: "Browse cars for rent in Dubai from rental companies and dealers. Compare daily, weekly and monthly prices, then message the advertiser on WhatsApp.",
  },
  {
    slug: "luxury-car-rental",
    type: "RENT",
    category: "luxury",
    title: "Luxury Car Rental in Dubai",
    h1: "Luxury car rental in Dubai",
    description: "Luxury cars available to rent in Dubai. Check deposits, mileage allowance and contact the rental company directly.",
  },
  {
    slug: "suv-rental",
    type: "RENT",
    category: "suv",
    title: "SUV Rental in Dubai",
    h1: "SUV rental in Dubai",
    description: "SUVs for rent across Dubai, from family crossovers to full-size four-wheel drives.",
  },
  {
    slug: "sports-car-rental",
    type: "RENT",
    category: "sports",
    title: "Sports car rental in Dubai",
    h1: "Sports car rental in Dubai",
    description: "Sports cars listed for rent in Dubai. Confirm availability, deposit and driver requirements with the advertiser.",
  },
  {
    slug: "mercedes-rental",
    type: "RENT",
    make: "Mercedes-Benz",
    title: "Mercedes Rental in Dubai",
    h1: "Mercedes-Benz rental in Dubai",
    description: "Mercedes-Benz cars listed for rent in Dubai by rental companies and dealers.",
  },
  {
    slug: "rent-range-rover",
    type: "RENT",
    make: "Range Rover",
    title: "Range Rover rental in Dubai",
    h1: "Rent a Range Rover in Dubai",
    description: "Range Rover listings for rent in Dubai, with daily, weekly and monthly rates where advertisers provide them.",
  },
  {
    slug: "cars-for-sale",
    type: "SALE",
    title: "Cars for sale in Dubai",
    h1: "Cars for sale in Dubai",
    description: "Cars for sale in Dubai from dealers, businesses and private sellers. Compare price, mileage and specification, then contact the seller.",
  },
  {
    slug: "used-cars",
    type: "SALE",
    condition: "used",
    title: "Used cars in Dubai",
    h1: "Used cars for sale in Dubai",
    description: "Used cars listed for sale in Dubai. Ask the seller about service history, accidents and registration before you pay.",
  },
  {
    slug: "mercedes-cars-for-sale",
    type: "SALE",
    make: "Mercedes-Benz",
    title: "Mercedes-Benz cars for sale in Dubai",
    h1: "Mercedes-Benz cars for sale in Dubai",
    description: "Mercedes-Benz cars listed for sale in Dubai by dealers and private sellers.",
  },
];

export function findIntent(slug: string) {
  return SEO_INTENTS.find((item) => item.slug === slug) ?? null;
}
