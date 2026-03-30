import { component$ } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  type RequestHandler,
  type DocumentHead
} from "@builder.io/qwik-city";

import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  createSession,
  isAuthenticated,
  validateCredentials
} from "~/lib/auth";
import { setPrivateNoStore } from "~/lib/cache";

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
      message: "Invalid credentials. Use the demo account shown below."
    });
  }

  createSession(event.cookie, email);
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
  const pageData = useLoginPageData();
  const loginAction = useLoginAction();


  return (
    <main class="flex min-h-screen w-full flex-col md:flex-row bg-background text-on-surface font-body antialiased overflow-x-hidden">
      {/* Brand Side: The Sentient Monolith Aesthetic */}
      <div class="relative hidden flex-col justify-between overflow-hidden bg-surface-container-lowest p-12 md:flex md:w-1/2">
        <div class="absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[120px]"></div>
        <div class="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-[100px]"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg">
              <span class="material-symbols-outlined text-on-primary font-bold">dataset</span>
            </div>
            <span class="text-2xl font-bold tracking-tighter text-on-surface">Aletheia</span>
          </div>
        </div>

        <div class="relative z-10 max-w-lg">
          <h1 class="mb-6 text-5xl font-extrabold leading-tight tracking-tight">
            Step into the <br />
            <span class="italic text-primary">Intelligence</span> Epoch.
          </h1>
          <p class="text-lg leading-relaxed text-tertiary">
            Access the most advanced neural engine designed for security, precision, and sentient-grade interaction.
          </p>
          <div class="mt-12 flex flex-col gap-6">
            <div class="flex items-start gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-high/40 p-4 backdrop-blur-md">
              <span class="material-symbols-outlined text-secondary">verified_user</span>
              <div>
                <p class="font-semibold text-on-surface">End-to-End Encryption</p>
                <p class="text-sm text-tertiary">Your data is secured with post-quantum algorithms.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-10">
          <div class="font-mono text-[10px] uppercase tracking-widest text-outline-variant">System Status: Nominal</div>
        </div>
        
        <div class="absolute inset-0 z-0 opacity-20 grayscale">
          <img 
            class="h-full w-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu9Sb7kiLmDwRbROAiHqVxncAqAkEzduETsv7e-ZzHFb49cyuKReM2huxpNE6i0a0WedcqDQ5ygJughJwJ55-3I41aeAk85j0fGBYoZGyILOCCk9O_cd2BYlUjN0EIIZV_-EBSvTDoq4oQ7YJ0ZILvdG7yYllCq4dKQUxquZ6RpFqjrWzofxK8SH_oAQBpuY65SJGAjEWelzI2D0c8KOUbRptADuC1vhFlPtSXZjPw4KWab9bQ0T2mQLq5PYSyuZ5_VqkriT2wSS0j" 
          />
        </div>
      </div>

      {/* Signup Form Side */}
      <div class="relative flex flex-1 flex-col items-center justify-center bg-surface p-6 md:p-24">
        <div class="w-full max-w-md">
          <div class="mb-10">
            <h2 class="mb-2 text-3xl font-bold tracking-tight text-on-surface">Initialize Access</h2>
            <p class="text-tertiary">Join the monolith and start building with memory.</p>
          </div>

          <div class="mb-8 rounded-xl border border-outline-variant/10 bg-surface-container-low p-6">
            <p class="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Demo Credentials</p>
            <div class="space-y-2 font-mono text-sm border-l-2 border-primary/30 pl-4">
              <div class="flex justify-between">
                <span class="text-tertiary">Email</span>
                <span class="text-on-surface">{pageData.value.demoEmail}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-tertiary">Password</span>
                <span class="text-on-surface">{pageData.value.demoPassword}</span>
              </div>
            </div>
          </div>

          <Form action={loginAction} class="space-y-6">
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-widest text-tertiary" for="email">Work Email</label>
              <input
                id="email"
                name="email"
                type="email"
                class="w-full rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors"
                placeholder="name@company.com"
                value={String(loginAction.formData?.get("email") ?? pageData.value.demoEmail)}
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
                placeholder="••••••••"
                value={String(loginAction.formData?.get("password") ?? pageData.value.demoPassword)}
                required
              />
            </div>

            {loginAction.value?.message && (
              <p class="text-sm text-red-400">{loginAction.value.message}</p>
            )}

            <button
              type="submit"
              class="w-full rounded-lg bg-primary py-4 font-bold text-on-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              Continue to the platform
            </button>
          </Form>

          <p class="mt-8 text-center text-xs text-tertiary">
            By signing up, you agree to our 
            <a href="#" class="ml-1 text-primary hover:underline">Terms</a> and 
            <a href="#" class="ml-1 text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Log In | ALETHEIA",
  meta: [
    {
      name: "description",
      content: "Initialize access to the Aletheia monolith."
    }
  ]
};
