/**
 * Login no longer uses the Grok OAuth broker.
 * Google is Better Auth's built-in social provider id `"google"`
 * (`socialProviders.google` in `server.ts`).
 * Callback: `/api/auth/callback/google`.
 */
export const GOOGLE_PROVIDER = "google" as const;
