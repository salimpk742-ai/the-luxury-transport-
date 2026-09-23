import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { REPORT_REASONS } from "@/lib/catalog";
import { sendReport } from "@/lib/marketplace/fns";
import { siteFromMatches, siteTitle } from "@/lib/site";
import { Button, Field, SelectInput, TextArea } from "@/components/ui";

export const Route = createFileRoute("/report-listing")({
  validateSearch: (search) => {
    const listing = typeof search.listing === "string" ? search.listing.replace(/\D/g, "").slice(0, 12) : "";
    return listing ? { listing } : {};
  },
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return {
      meta: [
        { title: siteTitle(site, "Report a listing") },
        { name: "description", content: "Report incorrect, suspicious, or unavailable vehicle listings." },
        { name: "robots", content: "noindex,follow" },
      ],
      links: [{ rel: "canonical", href: `${site.url}/report-listing` }],
    };
  },
  component: ReportPage,
});

function ReportPage() {
  const { listing } = Route.useSearch();
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [note, setNote] = useState("");
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-4xl text-ink">Report a listing</h1>
      <p className="mt-3 text-sm text-ink-soft">Tell an admin what looks wrong. This does not contact the advertiser, and it is not an emergency service or a police report.</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void sendReport({ data: { listingId: listing ? Number(listing) : null, reason, details } }).then((result) => {
            setNote(result.ok ? "Report sent. An admin can review it." : result.error);
          });
        }}
      >
        <Field label="Reason">
          <SelectInput value={reason} onChange={(event) => setReason(event.target.value)}>
            {REPORT_REASONS.map((item) => <option key={item}>{item}</option>)}
          </SelectInput>
        </Field>
        <Field label="Details"><TextArea rows={5} value={details} onChange={(event) => setDetails(event.target.value)} /></Field>
        {note ? <p className="text-sm">{note}</p> : null}
        <Button type="submit">Submit report</Button>
      </form>
    </main>
  );
}
