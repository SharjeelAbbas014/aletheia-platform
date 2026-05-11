import { component$ } from "@builder.io/qwik";
import { routeLoader$, Form, type DocumentHead } from "@builder.io/qwik-city";
import { UsersIcon, MailIcon } from "lucide-qwik";
import { buildSeoHead } from "~/lib/seo";
import { setPrivateNoStore } from "~/lib/cache";
import type { RequestHandler } from "@builder.io/qwik-city";
import { requireAuth } from "~/lib/auth";
import { getTeamMembers } from "~/lib/team";
import type { TeamMemberInfo } from "~/lib/team";

export const onRequest: RequestHandler = (event) => {
  setPrivateNoStore(event);
};

export const useTeamData = routeLoader$(async (event) => {
  requireAuth(event);
  const members = await getTeamMembers(event);
  return { members };
});

export default component$(() => {
  const data = useTeamData();

  return (
    <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
      <main class="flex-1 overflow-y-auto p-8 lg:p-12 mb-20 max-w-3xl mx-auto w-full pt-[104px]">
        <h1 class="font-headline text-4xl font-extrabold tracking-tighter text-on-surface mb-2">Team</h1>
        <p class="text-tertiary mb-8">Manage team members and invitations</p>

        {/* Members List */}
        <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 mb-8">
          <h3 class="flex items-center gap-2 text-lg font-bold mb-4">
            <UsersIcon class="w-5 h-5" />
            Members ({data.value.members.length})
          </h3>
          <div class="space-y-3">
            {data.value.members.map((m: TeamMemberInfo) => (
              <div key={m.user_id} class="flex items-center justify-between py-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p class="text-sm font-medium">{m.name}</p>
                    <p class="text-xs text-tertiary">{m.email}</p>
                  </div>
                </div>
                <span class={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                  m.role === "owner" ? "bg-amber-500/10 text-amber-400" :
                  m.role === "admin" ? "bg-blue-500/10 text-blue-400" :
                  "bg-surface-container-high text-tertiary"
                }`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Invite Form */}
        <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
          <h3 class="flex items-center gap-2 text-lg font-bold mb-4">
            <MailIcon class="w-5 h-5" />
            Invite Member
          </h3>
          <Form action="/api/team" class="flex gap-3">
            <input
              type="email"
              name="email"
              placeholder="colleague@example.com"
              class="flex-1 rounded-xl bg-black/40 border border-outline-variant/20 px-4 py-3 text-sm focus:outline-none focus:border-primary"
              required
            />
            <select name="role" class="rounded-xl bg-black/40 border border-outline-variant/20 px-4 py-3 text-sm focus:outline-none focus:border-primary">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" class="rounded-xl bg-primary text-on-primary px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity">
              Invite
            </button>
          </Form>
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Team | ALETHEIA",
  description: "Manage your team members.",
  pathname: "/platform/settings/team",
  noindex: true
});
