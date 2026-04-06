import type { RequestEventCommon } from "@builder.io/qwik-city";

type CookieStore = RequestEventCommon["cookie"];

const SESSION_COOKIE = "aletheia_session";
const USER_ID_COOKIE = "aletheia_user_id";
const USERNAME_COOKIE = "aletheia_username";

const ALETHEIA_URL = (process.env.ALETHEIA_URL ?? "http://localhost:3000").replace(/\/+$/, "");

const cookieBase = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 30
};

export interface AuthUser {
  user_id: string;
  username: string;
}

export async function loginUser(event: RequestEventCommon, username: string, password: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const response = await fetch(`${ALETHEIA_URL}/platform/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      return { ok: false, message: "Invalid username or password" };
    }

    const data = await response.json();
    // In a real implementation, the backend would return a session token.
    // For now, let's assume the backend provides a way to create one or we use user_id as a simple session.
    // Let's call create_session on the backend if available.
    
    const sessionResponse = await fetch(`${ALETHEIA_URL}/v1/admin/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "XXX1111AAA" }, // Internal admin call
        body: JSON.stringify({ user_id: data.user_id })
    });

    let sessionToken = data.user_id; // Fallback
    if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        sessionToken = sessionData.token;
    }

    event.cookie.set(SESSION_COOKIE, sessionToken, cookieBase);
    event.cookie.set(USER_ID_COOKIE, data.user_id, cookieBase);
    event.cookie.set(USERNAME_COOKIE, data.username, cookieBase);

    return { ok: true };
  } catch (e) {
    return { ok: false, message: "Network error. Is the engine running?" };
  }
}

export async function signupUser(event: RequestEventCommon, username: string, password: string): Promise<{ ok: boolean; message?: string }> {
    try {
      const response = await fetch(`${ALETHEIA_URL}/platform/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
  
      if (!response.ok) {
        const err = await response.text();
        return { ok: false, message: err || "Failed to create account" };
      }
  
      return await loginUser(event, username, password);
    } catch (e) {
      return { ok: false, message: "Network error. Is the engine running?" };
    }
}

export function clearSession(cookie: CookieStore) {
  cookie.delete(SESSION_COOKIE, { path: "/" });
  cookie.delete(USER_ID_COOKIE, { path: "/" });
  cookie.delete(USERNAME_COOKIE, { path: "/" });
}

export function isAuthenticated(cookie: CookieStore) {
  return !!getCurrentUser(cookie);
}

export function getCurrentUser(cookie: CookieStore): AuthUser | null {
  const session = cookie.get(SESSION_COOKIE)?.value;
  const user_id = cookie.get(USER_ID_COOKIE)?.value;
  const username = cookie.get(USERNAME_COOKIE)?.value;
  
  if (!session || !user_id || !username) return null;

  return { user_id, username };
}

export function requireAuth(event: RequestEventCommon) {
  const user = getCurrentUser(event.cookie);
  if (!user) {
    throw event.redirect(302, "/login");
  }
  return user;
}
