import { createFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { authClient, signIn } from "@/lib/auth/client";
import { emailAndPasswordEnabled } from "@/lib/auth/email-password";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ensureProfile, recordLogin } from "@/lib/marketplace/fns";
import { Button, Field, TextInput } from "@/components/ui";
import { noindexHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => {
    const redirect = typeof search.redirect === "string" && search.redirect.startsWith("/") && !search.redirect.startsWith("//") ? search.redirect : "/account";
    const error = typeof search.error === "string" ? search.error : "";
    return { redirect, error };
  },
  head: () => noindexHead("Sign in"),
  component: LoginPage,
});

function googleErrorMessage(code: string): string {
  if (!code) return "";
  if (code === "access_denied") return "Google sign-in was cancelled.";
  if (code === "state_mismatch") return "That sign-in expired. Press Continue with Google again.";
  if (code === "invalid_code" || code === "invalid_client") return "Google rejected the app credentials. The client secret in Vercel must be the secret from this same Google client.";
  return `Google sign-in failed (${code.replaceAll("_", " ")}).`;
}

function LoginPage() {
  const { redirect, error: errorFromUrl } = Route.useSearch();
  const { site } = useRouteContext({ from: "__root__" });
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => googleErrorMessage(errorFromUrl));
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isPending && user) {
    if (redirect.startsWith("/post/")) {
      const id = redirect.split("/")[2] ?? "";
      if (id) void navigate({ to: "/post/$id", params: { id } });
    } else if (redirect.startsWith("/post")) {
      void navigate({ to: "/post" });
    } else {
      void navigate({ to: "/account", search: { section: "listings" } });
    }
  }

  const after = async (kind: "login" | "registration") => {
    await ensureProfile({ data: { name, email } }).catch(() => undefined);
    await recordLogin({ data: { kind } }).catch(() => undefined);
    if (redirect.startsWith("/post/")) {
      const id = redirect.split("/")[2] ?? "";
      if (id) {
        await navigate({ to: "/post/$id", params: { id } });
        return;
      }
    }
    if (redirect === "/post" || redirect.startsWith("/post")) {
      await navigate({ to: "/post" });
      return;
    }
    await navigate({ to: "/account", search: { section: "listings" } });
  };

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-5xl items-center gap-8 px-4 py-10 lg:grid-cols-2">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-pine">{site.name}</p>
        <h1 className="mt-3 text-5xl text-ink">Sign in to list a car</h1>
        <p className="mt-3 max-w-md text-ink-soft">Customers can browse without an account. Advertisers sign in to post, save cars and see leads.</p>
      </div>
      <div className="rounded-3xl border border-line bg-card p-5">
        {emailAndPasswordEnabled ? (
          <div className="mb-4 grid grid-cols-2 rounded-full bg-sand p-1 text-sm">
            <button type="button" className={`h-10 rounded-full ${mode !== "up" ? "bg-card" : ""}`} onClick={() => setMode("in")}>Sign in</button>
            <button type="button" className={`h-10 rounded-full ${mode === "up" ? "bg-card" : ""}`} onClick={() => setMode("up")}>Create account</button>
          </div>
        ) : null}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setError("");
              void signIn("google", { callbackURL: redirect, errorCallbackURL: "/login" }).catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Google sign-in failed");
              });
            }}
            className="flex h-12 w-full items-center justify-center rounded-full border border-line bg-paper text-sm font-medium"
          >
            Continue with Google
          </button>
          {error && !emailAndPasswordEnabled ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
        </div>
        {emailAndPasswordEnabled ? (
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              setNotice("");
              void (async () => {
                if (mode === "reset") {
                  const result = await authClient.requestPasswordReset({ email, redirectTo: "/login" }).catch((err: unknown) => ({ error: { message: err instanceof Error ? err.message : "Reset failed" } }));
                  if (result.error) {
                    setNotice(`If email delivery is not connected yet, write to ${site.email} from the address on your account.`);
                  } else {
                    setNotice(`If a reset message can be sent, it is on its way. Otherwise contact ${site.email}.`);
                  }
                  setBusy(false);
                  return;
                }
                const result = mode === "up"
                  ? await authClient.signUp.email({ email, password, name: name || email.split("@")[0] || "Advertiser" })
                  : await authClient.signIn.email({ email, password });
                if (result.error) {
                  setError(result.error.message || "Could not sign in.");
                  setBusy(false);
                  return;
                }
                await after(mode === "up" ? "registration" : "login");
                setBusy(false);
              })();
            }}
          >
            <p className="text-center text-xs uppercase tracking-widest text-muted">or use email</p>
            {mode === "up" ? <Field label="Name"><TextInput value={name} onChange={(event) => setName(event.target.value)} required /></Field> : null}
            <Field label="Email"><TextInput type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>
            {mode !== "reset" ? (
              <Field label="Password" hint="At least 8 characters.">
                <TextInput type="password" autoComplete={mode === "up" ? "new-password" : "current-password"} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
              </Field>
            ) : null}
            {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
            {notice ? <p className="text-sm text-ink-soft">{notice}</p> : null}
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "up" ? "Create account" : mode === "reset" ? "Request reset" : "Sign in"}</Button>
            {mode !== "reset" ? (
              <button type="button" className="w-full text-sm text-muted" onClick={() => setMode("reset")}>Forgot password</button>
            ) : (
              <button type="button" className="w-full text-sm text-muted" onClick={() => setMode("in")}>Back to sign in</button>
            )}
          </form>
        ) : null}
        <p className="mt-4 text-xs text-muted">Phone numbers are for WhatsApp on your listings, not for signing in.</p>
      </div>
    </main>
  );
}
