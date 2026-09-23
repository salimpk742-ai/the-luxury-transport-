export const MAKES = [
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Range Rover",
  "Land Rover",
  "Porsche",
  "Lamborghini",
  "Ferrari",
  "Bentley",
  "Rolls-Royce",
  "Toyota",
  "Nissan",
  "Lexus",
  "Tesla",
  "Kia",
  "Hyundai",
  "Genesis",
  "Honda",
  "Mazda",
  "Mitsubishi",
  "Jeep",
  "GMC",
  "Chevrolet",
  "Cadillac",
  "Volkswagen",
  "Mini",
  "Maserati",
  "McLaren",
] as const;

export const MODELS: Record<string, string[]> = {
  "Mercedes-Benz": ["G-Class", "GLE", "GLS", "S-Class", "C-Class", "E-Class", "CLE", "AMG GT"],
  BMW: ["5 Series", "7 Series", "X5", "X6", "X7", "M4"],
  Audi: ["A6", "A8", "Q7", "Q8", "RS6"],
  "Range Rover": ["Autobiography", "Sport", "Velar", "Evoque"],
  "Land Rover": ["Defender", "Discovery"],
  Porsche: ["911", "Cayenne", "Panamera", "Macan"],
  Lamborghini: ["Huracan", "Urus", "Revuelto"],
  Ferrari: ["Roma", "296 GTB", "SF90", "Purosangue"],
  Toyota: ["Land Cruiser", "Camry", "Prado", "Yaris"],
  Nissan: ["Patrol", "Altima", "X-Trail"],
  Lexus: ["LX", "GX", "ES", "RX"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
  Kia: ["Carnival", "Sportage", "K5"],
  Hyundai: ["Tucson", "Santa Fe", "Sonata"],
};

export const BODY_TYPES = [
  "SUV",
  "Sedan",
  "Coupe",
  "Convertible",
  "Van",
  "Hatchback",
  "Pickup",
] as const;

export const TRANSMISSIONS = ["Automatic", "Manual"] as const;
export const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"] as const;
export const SPECS = ["GCC", "American", "European", "Japanese", "Other"] as const;
export const CONDITIONS = ["used", "new"] as const;
export const SELLER_TYPES = ["Dealer", "Rental Company", "Private Seller", "Business"] as const;

export const ACCOUNT_TYPES = [
  { value: "individual", label: "Private seller" },
  { value: "rental_company", label: "Rental company" },
  { value: "dealer", label: "Dealer" },
  { value: "business", label: "Automotive business" },
] as const;

export const YEARS = Array.from({ length: 19 }, (_, i) => 2026 - i);

export const REPORT_REASONS = [
  "Incorrect information",
  "Suspicious or fraudulent",
  "Wrong price",
  "Vehicle unavailable",
  "Duplicate listing",
  "Inappropriate content",
  "Other",
] as const;
