export function cleanText(input: unknown, max: number) {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")
    // Strip ASCII control characters from advertiser-supplied text.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, max);
}

export function slugify(input: string) {
  const s = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "car";
}

export function digits(input: string) {
  return input.replace(/\D/g, "");
}
