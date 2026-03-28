import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
  secure: process.env.NODE_ENV === "production"
};

export function validateCredentials(email: string, password: string) {
  return email === DEMO_EMAIL && password === DEMO_PASSWORD;
}

export async function createSession(email: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, "active", {
    ...cookieBase,
    maxAge: 60 * 60 * 24 * 30
  });
  store.set(USER_COOKIE, email, {
    ...cookieBase,
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    ...cookieBase,
    maxAge: 0
  });
  store.set(USER_COOKIE, "", {
    ...cookieBase,
    maxAge: 0
  });
}

export async function isAuthenticated() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === "active";
}

export async function getCurrentUser() {
  const store = await cookies();
  return {
    email: store.get(USER_COOKIE)?.value ?? DEMO_EMAIL
  };
}

export async function requireAuth() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}
