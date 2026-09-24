import type { ReactNode } from "react";
import { useRouteContext } from "@tanstack/react-router";

export function Prose({ title, children, reviewNote = true }: { title: string; children: ReactNode; reviewNote?: boolean }) {
  const { site } = useRouteContext({ from: "__root__" });
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-widest text-pine">{site.name}</p>
      <h1 className="mt-2 text-4xl text-ink">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-6 text-ink-soft [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
        {children}
      </div>
      {reviewNote ? (
        <p className="mt-8 rounded-2xl bg-sand px-4 py-3 text-sm text-ink">
          Have a UAE-qualified lawyer review this before launch. It is a practical marketplace policy, not a certification or a government approval.
        </p>
      ) : null}
    </article>
  );
}
