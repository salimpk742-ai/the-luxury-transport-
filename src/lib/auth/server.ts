/**
 * Self-hosted Better Auth for THIS app (server-only).
 *
 * Pre-wired for live preview + deploy — do not rewrite this file. To enable
 * local email/password, flip the flag in `./email-password` only (see auth skill).
 *
 * The app runs its own Better Auth at `/api/auth/*`, so the session cookie stays
 * on this app's own origin. Google sign-in uses Better Auth's built-in
 * `socialProviders.google` (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`).
 * The callback is `{BETTER_AUTH_URL}/api/auth/callback/google`.
 * Email/password is local to this app's database.
 *
 * Tri-mode:
 *   - Deployed: set `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `DATABASE_URL`,
 *     `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`. Google sign-in is direct.
 *   - Sandbox live preview: no Google credentials until those env vars exist.
 *     Email/password still works. Sessions persist in the embedded PGLite DB
 *     (same DB as app data); a process restart wipes both. Live-preview iframe
 *     clients use a bearer token (partitioned cookies) — see `client.ts`.
 *   - Off (`VITE_AUTH_ENABLED=false`): `requireUserId` resolves a dev user with
 *     no database configured, and throws fail-closed once `DATABASE_URL` is set
 *     (see `verify.server.ts`).
 *
 * NEVER import this from client code — it pulls in `pg` + the preview secret +
 * server-only Better Auth internals. The client uses `@/lib/auth/client`;
 * components read the user via `@/lib/auth/use-current-user`; server functions get
 * a verified id via `@/lib/auth/middleware`.
 */
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { emailAndPasswordEnabled } from "./email-password";
import { GATE_PROVIDER_ID, gateIdentitySessions } from "./gate-session.server";
import { pgliteDialect } from "./pglite-dialect";
import { PREVIEW_ALLOWED_HOSTS } from "./preview";

// Kick (and share) PGLite bootstrap as soon as the auth server module loads.
void ensureDbReady();

/**
 * Preview secret must outlive module reloads: PGLite (and its session rows) is
 * stored on `globalThis`, so an HMR re-eval of this file must NOT mint a new
 * signing secret or every existing session becomes invalid mid-dev. Process
 * restart clears both the secret and PGLite together.
 */
const globalAuthRef = globalThis as typeof globalThis & {
  __grokAuthPreviewSecret__?: string;
};
function previewAuthSecret(): string {
  globalAuthRef.__grokAuthPreviewSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__grokAuthPreviewSecret__;
}

/** Read an env var, treating empty/whitespace as unset. */
const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

// Explicit off-switch. The deployer sets `VITE_AUTH_ENABLED=true` when it
// provisions auth; set it to "false" to force auth off everywhere (dev user).
const authDisabled = env("VITE_AUTH_ENABLED") === "false";

/** True when sign-in is active. Independent of Google client credentials. */
export const authConfigured = !authDisabled;

const googleClientId = env("GOOGLE_CLIENT_ID");
const googleClientSecret = env("GOOGLE_CLIENT_SECRET");

// This app's own Better Auth origin. Production callbacks follow the host the
// visitor is actually on (Vercel or theluxurytransport.com). Sandbox previews use
// the dynamic `*.grok-sandbox.com` host. localhost is only a fallback when no
// host can be resolved.
const explicitBaseURL = env("BETTER_AUTH_URL");
const PRODUCTION_HOSTS = [
  "the-luxury-transport.vercel.app",
  "theluxurytransport.com",
  "www.theluxurytransport.com",
];
const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];
function hostFromUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).host;
  } catch {
    return undefined;
  }
}
const configuredHost = hostFromUrl(explicitBaseURL);
const previewAllowedHosts: string[] = [...PREVIEW_ALLOWED_HOSTS];
const allowedHosts: string[] = [
  ...new Set([
    ...previewAllowedHosts,
    ...PRODUCTION_HOSTS,
    ...(configuredHost ? [configuredHost] : []),
    "localhost",
    "127.0.0.1",
    "[::1]",
  ]),
];
const baseURL = explicitBaseURL
  ? explicitBaseURL
  : {
      allowedHosts,
      protocol: "auto" as const,
      fallback: "http://localhost:8080",
    };

const trustedOrigins: string[] = [
  ...allowedHosts.flatMap((host) => [`https://${host}`, `http://${host}`]),
  ...(explicitBaseURL ? [explicitBaseURL] : []),
  ...LOCAL_DEV_ORIGINS,
];

const databaseUrl = env("DATABASE_URL");

// Real Postgres when `DATABASE_URL` is set (deployed apps), else the app's
// embedded PGLite (preview) via a Kysely dialect — so Better Auth persists to the
// SAME DB as app data, including email/password users. Both use the Better Auth
// schema from `migrations/auth/0001_auth.sql`, copied into `migrations/` when
// the app turns sign-in on.
const database = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

/** Session token cookie name — also read by the live-preview popup completion page. */
export const SESSION_TOKEN_COOKIE = "__Host-grok-auth.session_token";

export const auth = betterAuth({
  baseURL,
  // Deployed apps inject BETTER_AUTH_SECRET. Preview: process-stable secret on
  // globalThis so HMR doesn't invalidate PGLite-backed sessions (see above).
  secret: env("BETTER_AUTH_SECRET") ?? previewAuthSecret(),
  database,

  // Direct Google. Default scopes are openid, email, and profile only.
  socialProviders: {
    google: {
      clientId: googleClientId ?? "",
      clientSecret: googleClientSecret ?? "",
      prompt: "select_account",
    },
  },

  // CSRF / origin check for credentialed auth POSTs (email sign-up/sign-in, …).
  // See `trustedOrigins` construction above — must cover live preview hosts AND
  // local loopback variants, or clients get "Invalid origin".
  trustedOrigins,

  // Google's email_verified claim is the identity proof. This app does not send
  // verification mail, so a password account's emailVerified stays false.
  // requireLocalEmailVerified must stay false or Better Auth refuses to link
  // that account and the visitor is stuck on "account not linked" instead of
  // signing into the user they already have. A new Google email still creates
  // one user. trustedProviders is only "google" (plus the preview gate).
  account: {
    encryptOAuthTokens: true,
    // The state is still saved in the database and checked. The extra cookie
    // check fails on the return from Google in some browsers, which looked
    // like an invalid login.
    skipStateCookieCheck: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", GATE_PROVIDER_ID],
      requireLocalEmailVerified: false,
    },
  },

  // Cache the session in the short-lived signed `session_data` cookie so reads
  // (incl. the client's `/get-session`) skip the DB — this shrinks the "loading"
  // window and reduces auth flicker. See the `auth` skill for the full
  // flicker-prevention guidance (gate on `isPending`; SSR the session).
  session: { cookieCache: { enabled: true, maxAge: 300 } },

  // Local email/password — toggled only via `./email-password` (not a plugin).
  ...(emailAndPasswordEnabled ? { emailAndPassword: { enabled: true } } : {}),

  // `__Host-` prefixed cookies: the browser REFUSES any same-named cookie that
  // carries a `Domain` attribute, so a sibling `*.grok.me` app cannot "toss" a
  // `Domain=.grok.me` session cookie onto this app. `__Host-` requires Secure +
  // Path=/ + no Domain; Better Auth otherwise uses `__Secure-` (which permits
  // Domain), so we drop its auto prefix (`useSecureCookies: false`) and set
  // Secure + the names ourselves. (Browsers allow Secure cookies on
  // `http://localhost`, so local dev still works.)
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
      session_data: { name: "__Host-grok-auth.session_data" },
      account_data: { name: "__Host-grok-auth.account_data" },
      dont_remember: { name: "__Host-grok-auth.dont_remember" },
    },
  },

  plugins: [
    gateIdentitySessions(),

    // Accept `Authorization: Bearer <session-token>` as an alternative to the
    // cookie. Needed for the LIVE PREVIEW: the app runs in an embedded iframe
    // where cookies are partitioned, so after popup sign-in it authenticates with
    // a bearer token instead (see `client.ts` / the `auth` skill). The hook only
    // fires when an Authorization header is present, so the cookie path
    // (deployed apps) is unaffected.
    bearer(),

    // Bridges Better Auth's Set-Cookie into TanStack Start responses. MUST be
    // last so it runs after every other plugin's hooks.
    tanstackStartCookies(),
  ],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}
