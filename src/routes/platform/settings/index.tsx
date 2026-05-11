import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, Link, Form, type DocumentHead } from "@builder.io/qwik-city";
import { ArrowLeftIcon, UserIcon, KeyIcon, UsersIcon, ChevronRightIcon } from "lucide-qwik";
import { buildSeoHead } from "~/lib/seo";
import { setPrivateNoStore } from "~/lib/cache";
import type { RequestHandler } from "@builder.io/qwik-city";
import { requireAuth } from "~/lib/auth";

export const onRequest: RequestHandler = (event) => {
  setPrivateNoStore(event);
};

export const useSettingsData = routeLoader$(async (event) => {
  const user = requireAuth(event);
  return { user };
});

export default component$(() => {
  const data = useSettingsData();

  const sections = [
    { href: "/platform/settings", label: "Profile", icon: UserIcon, current: true },
    { href: "/platform/settings/team", label: "Team", icon: UsersIcon, current: false },
  ];

  return (
    <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
      <main class="flex-1 overflow-y-auto p-8 lg:p-12 mb-20 max-w-3xl mx-auto w-full pt-[104px]">
        <header class="mb-12">
          <Link href="/platform" class="text-tertiary hover:text-primary flex items-center gap-1 transition-colors w-fit">
            <ArrowLeftIcon class="w-4 h-4" />
            Mission Control
          </Link>
          <h1 class="font-headline text-4xl font-extrabold tracking-tighter text-on-surface mt-4">Settings</h1>
        </header>

        {/* Sidebar-style links */}
        <div class="space-y-1 mb-8">
          {sections.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              class="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <div class="flex items-center gap-3">
                <Icon class="w-5 h-5 text-tertiary" />
                <span>{label}</span>
              </div>
              <ChevronRightIcon class="w-4 h-4 text-tertiary" />
            </Link>
          ))}
        </div>

        {/* Profile form */}
        <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 space-y-4">
          <h3 class="text-lg font-bold">Profile</h3>
          <div>
            <label class="text-sm font-bold uppercase tracking-widest text-tertiary block mb-2">Display Name</label>
            <input
              type="text"
              value={data.value.user.username}
              disabled
              class="w-full rounded-xl bg-black/40 border border-outline-variant/20 px-4 py-3 text-sm text-tertiary"
            />
          </div>
          <div>
            <label class="text-sm font-bold uppercase tracking-widest text-tertiary block mb-2">User ID</label>
            <input
              type="text"
              value={data.value.user.user_id}
              disabled
              class="w-full rounded-xl bg-black/40 border border-outline-variant/20 px-4 py-3 text-sm font-mono text-tertiary"
            />
          </div>
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Settings | ALETHEIA",
  description: "Manage your account settings.",
  pathname: "/platform/settings",
  noindex: true
});
