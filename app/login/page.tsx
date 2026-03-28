import Link from "next/link";

import { DEMO_EMAIL, DEMO_PASSWORD, isAuthenticated } from "@/lib/auth";
import { SiteNav } from "@/components/site-nav";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await isAuthenticated()) {
    return (
      <main>
        <SiteNav />
        <section className="mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center px-6 py-10 lg:px-10">
          <div className="glass-panel max-w-2xl rounded-[2.25rem] p-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Already signed in
            </div>
            <h1 className="display mt-4 text-4xl font-semibold tracking-[-0.05em] text-neutral-950">
              Your dashboard is ready.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-neutral-700">
              Head to the platform to create, revoke, and inspect API keys.
            </p>
            <div className="mt-6">
              <Link
                href="/platform"
                className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const params = searchParams ? await searchParams : undefined;
  const showError = params?.error === "1";

  return (
    <main>
      <SiteNav />
      <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            Platform access
          </div>
          <h1 className="display mt-4 text-5xl font-semibold tracking-[-0.06em] text-neutral-950">
            Log in and mint your first API key.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-neutral-700">
            This repo ships a cookie-backed demo auth flow so the product shell
            is clickable on day one. Replace it with your real provider when the
            control plane is ready.
          </p>

          <div className="glass-panel mt-8 rounded-[2rem] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Demo credentials
            </div>
            <div className="mt-4 grid gap-3 text-sm text-neutral-800">
              <div className="rounded-2xl border border-neutral-900/10 bg-white/80 px-4 py-3">
                <span className="font-semibold">Email:</span> {DEMO_EMAIL}
              </div>
              <div className="rounded-2xl border border-neutral-900/10 bg-white/80 px-4 py-3">
                <span className="font-semibold">Password:</span> {DEMO_PASSWORD}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[2.25rem] p-8">
          <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Sign in
          </div>
          <form action="/api/auth/login" method="post" className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={DEMO_EMAIL}
                required
                className="w-full rounded-2xl border border-neutral-900/12 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900/30"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                defaultValue={DEMO_PASSWORD}
                required
                className="w-full rounded-2xl border border-neutral-900/12 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900/30"
              />
            </div>

            {showError ? (
              <div className="rounded-2xl border border-[rgba(213,34,34,0.18)] bg-[rgba(255,241,240,0.92)] px-4 py-3 text-sm text-[#812f2f]">
                Invalid credentials. Use the demo account shown on the left.
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Continue to the platform
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

