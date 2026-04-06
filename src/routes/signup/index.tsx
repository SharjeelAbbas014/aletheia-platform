import { component$ } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  type RequestHandler,
  type DocumentHead,
  Link
} from "@builder.io/qwik-city";

import {
  signupUser,
  isAuthenticated
} from "~/lib/auth";
import { setPrivateNoStore } from "~/lib/cache";
import { buildSeoHead } from "~/lib/seo";

export const useSignupAction = routeAction$(async (data, event) => {
  const username = String(data.username ?? "").trim();
  const password = String(data.password ?? "");

  if (!username || !password) {
    return event.fail(400, {
      message: "Username and password are required."
    });
  }

  if (password.length < 8) {
    return event.fail(400, {
        message: "Password must be at least 8 characters long."
    });
  }

  const result = await signupUser(event, username, password);
  if (!result.ok) {
    return event.fail(400, {
      message: result.message || "Failed to create account."
    });
  }

  throw event.redirect(302, "/platform");
});

export const useAuthGuard = routeLoader$((event) => {
  const authenticated = isAuthenticated(event.cookie);
  if (authenticated) {
    throw event.redirect(302, "/platform");
  }
});

export const onRequest: RequestHandler = (event) => {
  setPrivateNoStore(event);
};

export default component$(() => {
  useAuthGuard();
  const signupAction = useSignupAction();

  return (
    <main class="flex min-h-screen w-full flex-col md:flex-row bg-background text-on-surface font-body antialiased overflow-x-hidden">
      {/* Brand Side */}
      <div class="relative hidden flex-col justify-between overflow-hidden bg-surface-container-lowest p-12 md:flex md:w-1/2">
        <div class="absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[120px]"></div>
        <div class="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-[100px]"></div>
        
        <div class="relative z-10">
          <Link href="/" class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg">
              <span class="material-symbols-outlined notranslate normal-case text-on-primary font-bold">dataset</span>
            </div>
            <span class="text-2xl font-bold tracking-tighter text-on-surface">Aletheia</span>
          </Link>
        </div>

        <div class="relative z-10 max-w-lg">
          <h1 class="mb-6 text-5xl font-extrabold leading-tight tracking-tight">
            Create your <br />
            <span class="italic text-primary">Identity</span> in the Graph.
          </h1>
          <p class="text-lg leading-relaxed text-tertiary">
            Join the decentralized truth layer and start building persistent, secure memory for your agents.
          </p>
        </div>

        <div class="relative z-10">
          <div class="font-mono text-[10px] uppercase tracking-widest text-outline-variant">System Status: Nominal</div>
        </div>
      </div>

      {/* Signup Form Side */}
      <div class="relative flex flex-1 flex-col items-center justify-center bg-surface p-6 md:p-24">
        <div class="w-full max-w-md">
          <div class="mb-10">
            <h2 class="mb-2 text-3xl font-bold tracking-tight text-on-surface">Get Started</h2>
            <p class="text-tertiary">Initialize your workspace and API keys.</p>
          </div>

          <Form action={signupAction} class="space-y-6">
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-widest text-tertiary" for="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                class="w-full rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors"
                placeholder="Choose a username"
                required
              />
            </div>
            
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-widest text-tertiary" for="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                class="w-full rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors"
                placeholder="At least 8 characters"
                required
              />
            </div>

            {signupAction.value?.message && (
              <p class="text-sm text-red-400">{signupAction.value.message}</p>
            )}

            <button
              type="submit"
              class="w-full rounded-lg bg-primary py-4 font-bold text-on-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              Create Account
            </button>
          </Form>

          <p class="mt-8 text-center text-sm text-tertiary">
            Already have an account? 
            <Link href="/login" class="ml-1 text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Sign Up | ALETHEIA",
  description: "Create your Aletheia account.",
  pathname: "/signup",
  noindex: true
});
