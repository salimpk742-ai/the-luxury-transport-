import { Link } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-card px-6 py-14 text-center">
      <SearchX className="mx-auto size-8 text-muted" aria-hidden="true" />
      <h2 className="mt-4 text-3xl text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <meta name="robots" content="noindex, follow" />
      <p className="text-xs font-medium uppercase tracking-widest text-pine">404</p>
      <h1 className="mt-3 text-4xl text-ink">Sorry, we couldn't find that car.</h1>
      <p className="mt-3 text-ink-soft">The page may have moved, or the listing is no longer published.</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link to="/rent" className="inline-flex h-12 items-center rounded-full bg-pine px-5 text-sm font-medium text-paper">Browse rental cars</Link>
        <Link to="/buy" className="inline-flex h-12 items-center rounded-full border border-line bg-card px-5 text-sm font-medium text-ink">Browse cars for sale</Link>
        <Link to="/" className="inline-flex h-12 items-center rounded-full px-5 text-sm font-medium text-pine">Go home</Link>
      </div>
    </main>
  );
}

export function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <div className="space-y-3 px-4 py-8" aria-busy="true" aria-live="polite">
      <div className="h-8 w-48 animate-pulse rounded-full bg-sand" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-line bg-card">
            <div className="aspect-photo animate-pulse bg-sand" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-sand" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-sand" />
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only">{label}</p>
    </div>
  );
}
