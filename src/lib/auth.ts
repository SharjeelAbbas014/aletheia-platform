import type { RequestEventCommon } from "@builder.io/qwik-city";

type CookieStore = RequestEventCommon["cookie"];

const SESSION_COOKIE = "aletheia_session";
const USER_COOKIE = "aletheia_user";

export const DEMO_EMAIL =
  process.env.ALETHEIA_DEMO_EMAIL ?? "demo@aletheia.dev";
export const DEMO_PASSWORD =
  process.env.ALETHEIA_DEMO_PASSWORD ?? "aletheia-demo";

const cookieBase = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 30
};

export function validateCredentials(email: string, password: string) {
  return email === DEMO_EMAIL && password === DEMO_PASSWORD;
}

export function createSession(cookie: CookieStore, email: string) {
  cookie.set(SESSION_COOKIE, "active", cookieBase);
  cookie.set(USER_COOKIE, email, cookieBase);
}

export function clearSession(cookie: CookieStore) {
  cookie.delete(SESSION_COOKIE, { path: "/" });
  cookie.delete(USER_COOKIE, { path: "/" });
}

export function isAuthenticated(cookie: CookieStore) {
  return cookie.get(SESSION_COOKIE)?.value === "active";
}

export function getCurrentUser(cookie: CookieStore) {
  return {
    email: cookie.get(USER_COOKIE)?.value ?? DEMO_EMAIL
  };
}

export function requireAuth(event: RequestEventCommon) {
  if (!isAuthenticated(event.cookie)) {
    throw event.redirect(302, "/login");
  }

  return getCurrentUser(event.cookie);
}
