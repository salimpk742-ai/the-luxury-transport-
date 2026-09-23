import assert from "node:assert/strict";
import test from "node:test";
import { betterAuth } from "better-auth";

const BASE = "https://theluxurycars.com";
const SECRET = "test-secret-test-secret-test-secret-32chars";

function jwt(payload) {
  const part = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${part({ alg: "none", typ: "JWT" })}.${part(payload)}.sig`;
}

function cookieHeader(response) {
  return response.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
}

function installGoogleTokenMock(idToken) {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const href = String(url);
    if (href.startsWith("https://oauth2.googleapis.com/token")) {
      return new Response(
        JSON.stringify({
          access_token: "access-token",
          id_token: idToken,
          token_type: "Bearer",
          expires_in: 3600,
          scope: "openid email profile",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }
    return original(url, init);
  };
  return () => {
    globalThis.fetch = original;
  };
}

function createAuth() {
  return betterAuth({
    baseURL: BASE,
    secret: SECRET,
    emailAndPassword: { enabled: true },
    socialProviders: {
      google: {
        clientId: "test-client.apps.googleusercontent.com",
        clientSecret: "test-google-secret",
        prompt: "select_account",
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
        requireLocalEmailVerified: false,
      },
    },
  });
}

async function api(auth, path, { method = "GET", body, cookie, origin = BASE } = {}) {
  const headers = new Headers({ origin });
  if (body) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  return auth.handler(
    new Request(`${BASE}/api/auth${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
}

test("direct Google sign-in URL, session, link, and sign-out", async () => {
  const auth = createAuth();
  const email = "same.person@example.com";
  const password = "password-123";

  const signUp = await api(auth, "/sign-up/email", {
    method: "POST",
    body: { email, password, name: "Password User" },
  });
  assert.equal(signUp.status, 200);
  const passwordUser = await signUp.json();
  assert.equal(passwordUser.user.email, email);
  const passwordUserId = passwordUser.user.id;

  const start = await api(auth, "/sign-in/social", {
    method: "POST",
    body: { provider: "google", callbackURL: "/account", disableRedirect: true },
  });
  assert.equal(start.status, 200);
  const started = await start.json();
  const authorize = new URL(started.url);
  assert.equal(authorize.origin, "https://accounts.google.com");
  assert.equal(authorize.pathname, "/o/oauth2/v2/auth");
  assert.equal(authorize.searchParams.get("redirect_uri"), `${BASE}/api/auth/callback/google`);
  assert.equal(authorize.searchParams.get("client_id"), "test-client.apps.googleusercontent.com");
  const scopes = (authorize.searchParams.get("scope") ?? "").split(" ").sort();
  assert.deepEqual(scopes, ["email", "openid", "profile"]);
  for (const banned of ["gmail", "drive", "calendar", "contacts"]) {
    assert.equal(authorize.searchParams.get("scope")?.includes(banned), false);
  }
  assert.equal(started.url.includes("auth.grok.me"), false);
  assert.equal(started.url.includes("grok-google"), false);
  assert.equal(authorize.searchParams.get("prompt"), "select_account");

  const state = authorize.searchParams.get("state");
  assert.ok(state);
  const oauthCookie = cookieHeader(start);
  assert.ok(oauthCookie);

  const restore = installGoogleTokenMock(
    jwt({
      sub: "google-subject-1",
      email,
      email_verified: true,
      name: "Same Person",
    }),
  );
  try {
    const callback = await api(
      auth,
      `/callback/google?code=auth-code&state=${encodeURIComponent(state)}`,
      { cookie: oauthCookie },
    );
    assert.ok(callback.status === 302 || callback.status === 200, `callback status ${callback.status}`);
    const sessionCookie = cookieHeader(callback);
    assert.ok(sessionCookie);
    const session = await api(auth, "/get-session", { cookie: sessionCookie });
    assert.equal(session.status, 200);
    const linked = await session.json();
    assert.equal(linked.user.id, passwordUserId);
    assert.equal(linked.user.email, email);

    const again = await api(auth, "/sign-in/social", {
      method: "POST",
      body: { provider: "google", callbackURL: "/account", disableRedirect: true },
    });
    const againBody = await again.json();
    const againUrl = new URL(againBody.url);
    const againState = againUrl.searchParams.get("state");
    const returning = await api(
      auth,
      `/callback/google?code=auth-code-2&state=${encodeURIComponent(againState)}`,
      { cookie: cookieHeader(again) },
    );
    const returningSession = await api(auth, "/get-session", { cookie: cookieHeader(returning) });
    const returningUser = await returningSession.json();
    assert.equal(returningUser.user.id, passwordUserId);

    const fresh = await api(auth, "/sign-in/social", {
      method: "POST",
      body: { provider: "google", callbackURL: "/account", disableRedirect: true },
    });
    const freshBody = await fresh.json();
    const freshState = new URL(freshBody.url).searchParams.get("state");
    const previousFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      if (String(url).startsWith("https://oauth2.googleapis.com/token")) {
        return new Response(
          JSON.stringify({
            access_token: "access-token-2",
            id_token: jwt({
              sub: "google-subject-2",
              email: "new.google.user@example.com",
              email_verified: true,
              name: "New Google User",
            }),
            token_type: "Bearer",
            expires_in: 3600,
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return previousFetch(url, init);
    };
    const created = await api(
      auth,
      `/callback/google?code=auth-code-3&state=${encodeURIComponent(freshState)}`,
      { cookie: cookieHeader(fresh) },
    );
    const createdSession = await api(auth, "/get-session", { cookie: cookieHeader(created) });
    const createdUser = await createdSession.json();
    assert.equal(createdUser.user.email, "new.google.user@example.com");
    assert.notEqual(createdUser.user.id, passwordUserId);

    const signedOut = await api(auth, "/sign-out", { method: "POST", cookie: cookieHeader(created) });
    assert.equal(signedOut.status, 200);
    const after = await api(auth, "/get-session", { cookie: cookieHeader(signedOut) || cookieHeader(created) });
    const afterBody = await after.json();
    assert.equal(afterBody, null);
  } finally {
    restore();
  }
});
