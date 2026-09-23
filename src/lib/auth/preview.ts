/**
 * Hosts Better Auth may treat as this app's own origin in the sandbox.
 *
 * Google sign-in is Better Auth's built-in provider (`socialProviders.google`).
 * There is no Grok OAuth broker client. In local/preview there is no fixed
 * public URL, so the dynamic base URL is limited to these hosts.
 */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
