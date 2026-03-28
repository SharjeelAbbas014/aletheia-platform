import { component$ } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  type DocumentHead
} from "@builder.io/qwik-city";

import { useSession } from "../layout";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  createSession,
  validateCredentials
} from "~/lib/auth";

export const useLoginPageData = routeLoader$(() => {
  return {
    demoEmail: DEMO_EMAIL,
    demoPassword: DEMO_PASSWORD
  };
});

export const useLoginAction = routeAction$(async (data, event) => {
  const email = String(data.email ?? "").trim();
  const password = String(data.password ?? "");

  if (!validateCredentials(email, password)) {
    return event.fail(400, {
      message: "Invalid credentials. Use the demo account shown on this page."
    });
  }

  createSession(event.cookie, email);
  throw event.redirect(302, "/platform");
});

export default component$(() => {
  const session = useSession();
  const pageData = useLoginPageData();
  const loginAction = useLoginAction();

  if (session.value.authenticated) {
    return (
      <main class="page-pad">
        <section class="shell narrow-shell">
          <div class="card page-card">
            <div class="eyebrow">Already signed in</div>
            <h1>Your dashboard is ready.</h1>
            <p>
              Head to the platform to create, revoke, and inspect API keys.
            </p>
            <a href="/platform" class="button button-dark">
              Open dashboard
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main class="page-pad">
      <section class="shell two-column auth-grid">
        <div>
          <div class="eyebrow">Platform access</div>
          <h1>Log in and mint your first API key.</h1>
          <p class="lead-copy">
            This project ships a cookie-backed demo auth flow so the product
            shell stays clickable without external infrastructure. Replace it
            with your real provider when the control plane is ready.
          </p>

          <div class="card page-card">
            <div class="metric-label">Demo credentials</div>
            <div class="credential-list">
              <div class="credential-item">
                <strong>Email:</strong> {pageData.value.demoEmail}
              </div>
              <div class="credential-item">
                <strong>Password:</strong> {pageData.value.demoPassword}
              </div>
            </div>
          </div>
        </div>

        <div class="card page-card">
          <div class="metric-label">Sign in</div>
          <Form action={loginAction} class="form-stack">
            <label class="field">
              <span>Work email</span>
              <input
                name="email"
                type="email"
                value={
                  String(loginAction.formData?.get("email") ?? pageData.value.demoEmail)
                }
                required
              />
            </label>

            <label class="field">
              <span>Password</span>
              <input
                name="password"
                type="password"
                value={
                  String(
                    loginAction.formData?.get("password") ?? pageData.value.demoPassword
                  )
                }
                required
              />
            </label>

            {loginAction.value?.message ? (
              <div class="notice notice-error">{loginAction.value.message}</div>
            ) : null}

            <button type="submit" class="button button-dark button-wide">
              Continue to the platform
            </button>
          </Form>
        </div>
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Log In | Aletheia",
  meta: [
    {
      name: "description",
      content: "Demo login for the hosted Aletheia control plane shell."
    }
  ]
};
