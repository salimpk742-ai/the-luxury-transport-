import { digits } from "@/lib/text";

export function aed(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "";
  return `AED ${new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(value)}`;
}

export function km(value: number) {
  return `${new Intl.NumberFormat("en-AE").format(value)} km`;
}

export function listingHref(listing: {
  type: string;
  slugVehicle: string;
  slugArea: string;
  id: number;
}) {
  const root = listing.type === "SALE" ? "/buy" : "/rent";
  return `${root}/${listing.slugVehicle}/${listing.slugArea}/${listing.id}`;
}

export function inquiryMessage(
  siteName: string,
  listing: { type: string; title: string },
) {
  if (listing.type === "RENT") {
    return `Hello, I found your ${listing.title} rental listing on ${siteName}. I would like to know about availability and rental terms.`;
  }
  return `Hello, I found your ${listing.title} listing on ${siteName}. Is this vehicle available?`;
}

export function whatsappHref(phone: string, message: string) {
  const n = digits(phone);
  if (!n) return "";
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export function telHref(phone: string) {
  const n = digits(phone);
  if (!n) return "";
  return `tel:+${n}`;
}

export function accountTypeLabel(value: string) {
  switch (value) {
    case "rental_company":
      return "Rental company";
    case "dealer":
      return "Dealer";
    case "business":
      return "Automotive business";
    default:
      return "Private seller";
  }
}

export function sellerTypeFor(accountType: string) {
  switch (accountType) {
    case "rental_company":
      return "Rental Company";
    case "dealer":
      return "Dealer";
    case "business":
      return "Business";
    default:
      return "Private Seller";
  }
}

export function statusLabel(status: string) {
  switch (status) {
    case "PENDING_REVIEW":
      return "Pending review";
    case "PUBLISHED":
      return "Active";
    case "PAUSED":
      return "Paused";
    case "EXPIRED":
      return "Expired";
    case "SOLD":
      return "Sold";
    case "RENTED":
      return "Rented";
    case "REJECTED":
      return "Rejected";
    case "DELETED":
      return "Deleted";
    default:
      return "Draft";
  }
}

export function deliverySummary(listing: {
  deliveryAvailable?: boolean;
  deliveryScope?: string;
  deliveryAreas?: string;
  deliveryFee?: string;
  airportDelivery?: boolean;
  delivery?: string;
}) {
  if (!listing.deliveryAvailable) return listing.delivery || "";
  const parts: string[] = [];
  if (listing.deliveryScope === "dubai") parts.push("Dubai-wide");
  else if (listing.deliveryAreas) parts.push(listing.deliveryAreas);
  else parts.push("Offered");
  if (listing.airportDelivery) parts.push("Airport delivery");
  if (listing.deliveryFee) parts.push(`Fee ${listing.deliveryFee}`);
  if (listing.delivery) parts.push(listing.delivery);
  return parts.join(" · ");
}
