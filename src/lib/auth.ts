import type { RequestEventCommon } from "@builder.io/qwik-city";
import { getSupabaseClient } from "./supabase";

type CookieStore = RequestEventCommon["cookie"];

const SESSION_COOKIE = "aletheia_session";
const USER_ID_COOKIE = "aletheia_user_id";
const USERNAME_COOKIE = "aletheia_username";

const cookieBase = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: import.meta.env.PROD,
  maxAge: 60 * 60 * 24 * 30
};

export interface AuthUser {
  user_id: string;
  username: string; // display name stored in user_metadata
}

export async function loginUser(
  event: RequestEventCommon,
  email: string,
  password: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user || !data.session) {
      return { ok: false, message: error?.message || "Invalid email or password." };
    }

    const displayName = data.user.user_metadata?.display_name || email.split("@")[0];

    event.cookie.set(SESSION_COOKIE, data.session.access_token, cookieBase);
    event.cookie.set(USER_ID_COOKIE, data.user.id, cookieBase);
    event.cookie.set(USERNAME_COOKIE, displayName, cookieBase);

    return { ok: true };
  } catch (e) {
    return { ok: false, message: "Network error communicating with auth server." };
  }
}

export async function signupUser(
  event: RequestEventCommon,
  email: string,
  password: string,
  displayName?: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split("@")[0] }
      }
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    // If email confirmation is disabled in Supabase, session is returned immediately
    if (data.session) {
      const name = displayName || email.split("@")[0];
      event.cookie.set(SESSION_COOKIE, data.session.access_token, cookieBase);
      event.cookie.set(USER_ID_COOKIE, data.user!.id, cookieBase);
      event.cookie.set(USERNAME_COOKIE, name, cookieBase);
      return { ok: true };
    }

    return { ok: false, message: "Check your email for a confirmation link to complete sign up." };
  } catch (e) {
    return { ok: false, message: "Network error." };
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
