import { createFileRoute } from "@tanstack/react-router";

/** Temporary: ask Google whether the production client secret is accepted. Returns only an error code. */
export const Route = createFileRoute("/api/google-check")({
  server: {
    handlers: {
      GET: async () => {
        const id = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
        const secret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
        const body = new URLSearchParams({
          code: "invalid",
          client_id: id,
          client_secret: secret,
          redirect_uri: "https://the-luxury-transport.vercel.app/api/auth/callback/google",
          grant_type: "authorization_code",
          code_verifier: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP",
        });
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        const json = (await response.json().catch(() => ({}))) as { error?: string };
        return Response.json({
          google: typeof json.error === "string" ? json.error : "unknown",
          idSet: Boolean(id),
          secretSet: Boolean(secret),
          idMatchesConsole: id.startsWith("423235497375-"),
        });
      },
    },
  },
});
