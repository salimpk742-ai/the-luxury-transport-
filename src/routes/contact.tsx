import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { sendContact } from "@/lib/marketplace/fns";
import { publicHead } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";
import { Button, Field, TextArea, TextInput } from "@/components/ui";

export const Route = createFileRoute("/contact")({
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return publicHead(site, {
      title: `Contact | ${site.name}`,
      description: `Contact ${site.name} about the marketplace. Vehicle questions go to the advertiser on the listing.`,
      path: "/contact",
    });
  },
  component: ContactPage,
});

function ContactPage() {
  const { site } = useRouteContext({ from: "__root__" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [note, setNote] = useState("");

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-4xl text-ink">Contact</h1>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        {site.name} is a marketplace. For a specific car, use the WhatsApp or phone number on that listing — you are contacting the advertiser, not the platform.
      </p>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        Marketplace support: {site.email}. This form is for questions about the website itself.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void sendContact({ data: { name, email, topic: subject || "general", message, company } }).then((result) => {
            setNote(result.ok
              ? `Message saved for the marketplace team. If you need a reply sooner, email ${site.email}. Vehicle matters stay with the advertiser.`
              : result.error);
            if (result.ok) {
              setMessage("");
              setSubject("");
            }
          });
        }}
      >
        <Field label="Name"><TextInput value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" /></Field>
        <Field label="Email"><TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></Field>
        <Field label="Subject"><TextInput value={subject} onChange={(event) => setSubject(event.target.value)} required /></Field>
        <Field label="Message"><TextArea required rows={5} value={message} onChange={(event) => setMessage(event.target.value)} /></Field>
        <div className="hidden" aria-hidden="true">
          <label>
            Company
            <input tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
          </label>
        </div>
        {note ? <p className="text-sm text-ink" role="status">{note}</p> : null}
        <Button type="submit">Send</Button>
      </form>
    </main>
  );
}
