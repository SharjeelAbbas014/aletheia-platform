import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, routeAction$, Form, type DocumentHead } from "@builder.io/qwik-city";
import {
  UserIcon,
  UsersIcon,
  FileTextIcon,
  MailIcon,
  CheckIcon,
  CopyIcon,
  PlusIcon,
  Trash2Icon,
  ChevronRightIcon,
} from "lucide-qwik";
import { buildSeoHead } from "~/lib/seo";
import { setPrivateNoStore } from "~/lib/cache";
import type { RequestHandler } from "@builder.io/qwik-city";
import { requireAuth } from "~/lib/auth";
import { getTeamMembers } from "~/lib/team";
import type { TeamMemberInfo } from "~/lib/team";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { getContextTemplates, createContextTemplate, deleteContextTemplate } from "~/lib/context-templates";
import { getClusters } from "~/lib/clusters";

export const onRequest: RequestHandler = (event) => {
  setPrivateNoStore(event);
};

export const useSettingsData = routeLoader$(async (event) => {
  const user = requireAuth(event);
  const supabase = getAdminSupabaseClient(event.env);
  const members = await getTeamMembers(event);
  const clusters = await getClusters(event);
  const clusterId = clusters?.[0]?.id || "";
  const templates = clusterId ? await getContextTemplates(event, clusterId) : [];
  return { user, members, templates, clusterId, clusters };
});

export const useCreateTemplate = routeAction$(async (data, event) => {
  requireAuth(event);
  const name = String(data.name || "");
  const tmpl = String(data.template || "");
  const clusterId = String(data.cluster_id || "");
  if (!name || !tmpl || !clusterId) return event.fail(400, { message: "All fields required" });
  await createContextTemplate(event, clusterId, name, tmpl);
  return { success: true };
});

export const useDeleteTemplate = routeAction$(async (data, event) => {
  requireAuth(event);
  await deleteContextTemplate(event, String(data.id || ""));
  return { success: true };
});

const PREDEFINED_TEMPLATES = [
  {
    name: "Compact",
    template: "# User Context\n%{user_summary}\n\n# Relevant Facts\n%{facts limit=5}\n\n# Graph Context\n%{graph_neighbors n=5}",
  },
  {
    name: "Conversational",
    template: "The user %{user_summary}\n\nHere are relevant facts about them:\n%{facts limit=8}\n\nRecent activity from the %{temporal_range days=7}:\n%{facts limit=5}",
  },
  {
    name: "Enterprise RAG",
    template: "USER PROFILE\n%{user_summary}\n\nRELATED ENTITIES\n%{related_entities}\n\nSUPPORTING FACTS (limit 15)\n%{facts limit=15}\n\nKNOWLEDGE GRAPH CONTEXT\n%{graph_neighbors n=10}",
  },
];

const tabs = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "team", label: "Team", icon: UsersIcon },
  { id: "templates", label: "Context Templates", icon: FileTextIcon },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default component$(() => {
  const data = useSettingsData();
  const createAction = useCreateTemplate();
  const deleteAction = useDeleteTemplate();

  const activeTab = useSignal<TabId>("profile");

  const showCreateForm = useSignal(false);
  const newName = useSignal("");
  const newTemplate = useSignal("");
  const copiedId = useSignal("");

  return (
    <div class="ml-0 flex-1 overflow-y-auto p-6 md:ml-64 lg:p-8">
      <header class="mb-6">
        <h1 class="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Settings</h1>
        <p class="mt-1 text-sm text-tertiary">Manage your account, team, and memory context templates.</p>
      </header>

      <div class="mb-6 inline-flex rounded-xl border border-outline-variant/10 bg-surface-container-low p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            class={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all ${
              activeTab.value === id
                ? "bg-primary text-on-primary shadow-sm"
                : "text-tertiary hover:text-on-surface"
            }`}
            onClick$={() => { activeTab.value = id; }}
          >
            <Icon class={`w-3.5 h-3.5 ${activeTab.value === id ? "text-on-primary" : "text-tertiary"}`} />
            {label}
          </button>
        ))}
      </div>

      {/* ───── Profile Tab ───── */}
      {activeTab.value === "profile" && (
        <div class="max-w-2xl space-y-6">
          <div class="rounded-xl border border-outline-variant/10 bg-surface-container-low p-6">
            <div class="flex items-start gap-5">
              <div class="h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-on-primary shadow-sm">
                {data.value.user.username.slice(0, 2).toUpperCase()}
              </div>
              <div class="pt-1">
                <h2 class="text-lg font-bold text-on-surface">{data.value.user.username}</h2>
                <p class="text-sm text-tertiary mt-0.5">Free Tier Account</p>
                <div class="flex items-center gap-1.5 mt-2">
                  <span class="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-bold text-green-400 uppercase tracking-wider">Active</span>
                  <span class="text-[10px] text-tertiary">Member since {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-outline-variant/10 bg-surface-container-low divide-y divide-outline-variant/5">
            <div class="p-5">
              <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-tertiary mb-1.5">Display Name</p>
              <p class="text-sm font-semibold text-on-surface">{data.value.user.username}</p>
            </div>
            <div class="p-5">
              <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-tertiary mb-1.5">User ID</p>
              <div class="flex items-center gap-2">
                <code class="flex-1 text-xs font-mono text-tertiary bg-black/30 rounded-md px-3 py-2 border border-outline-variant/5 truncate">{data.value.user.user_id}</code>
                <button
                  class="shrink-0 h-8 w-8 flex items-center justify-center rounded-md bg-surface-container-high text-tertiary hover:text-primary hover:bg-primary/10 transition-all"
                  onClick$={async () => {
                    await navigator.clipboard.writeText(data.value.user.user_id);
                    copiedId.value = "user_id";
                    setTimeout(() => copiedId.value = "", 2000);
                  }}
                  title="Copy User ID"
                >
                  {copiedId.value === "user_id" ? <CheckIcon class="w-3.5 h-3.5 text-green-400" /> : <CopyIcon class="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───── Team Tab ───── */}
      {activeTab.value === "team" && (
        <div class="max-w-2xl space-y-6">
          <div class="rounded-xl border border-outline-variant/10 bg-surface-container-low p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center h-8 w-8 rounded-lg bg-surface-container-high text-primary">
                  <UsersIcon class="w-4 h-4" />
                </div>
                <h2 class="text-sm font-bold text-on-surface">Members ({data.value.members.length})</h2>
              </div>
            </div>
            <div class="space-y-1">
              {data.value.members.map((m: TeamMemberInfo, i: number) => (
                <div key={m.user_id} class="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-surface-container-high/50 transition-colors">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-xs font-bold text-on-surface">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-on-surface truncate">{m.name}</p>
                      <p class="text-xs text-tertiary truncate">{m.email}</p>
                    </div>
                  </div>
                  <span class={`shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
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

          <div class="rounded-xl border border-outline-variant/10 bg-surface-container-low p-5">
            <div class="flex items-center gap-2 mb-4">
              <div class="flex items-center justify-center h-8 w-8 rounded-lg bg-surface-container-high text-primary">
                <MailIcon class="w-4 h-4" />
              </div>
              <h2 class="text-sm font-bold text-on-surface">Invite Member</h2>
            </div>
            <Form action="/api/team" class="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                name="email"
                placeholder="colleague@example.com"
                class="flex-1 rounded-lg bg-black/40 border border-outline-variant/15 px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary/50 transition-colors placeholder:text-tertiary/40"
                required
              />
              <select name="role" class="rounded-lg bg-black/40 border border-outline-variant/15 px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary/50 transition-colors">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" class="rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-on-primary hover:opacity-90 transition-opacity shadow-sm shrink-0">
                Send Invite
              </button>
            </Form>
          </div>
        </div>
      )}

      {/* ───── Context Templates Tab ───── */}
      {activeTab.value === "templates" && (
        <div class="max-w-3xl space-y-6">
          <p class="text-sm text-tertiary leading-relaxed">Define how memories are formatted when sent to your LLM. Use markers like <code class="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded">{'{facts limit=10}'}</code> to control output.</p>

          {/* Built-in Templates */}
          <div>
            <h3 class="text-[10px] font-bold uppercase tracking-[0.15em] text-tertiary mb-3">Built-in Templates</h3>
            <div class="grid gap-3 sm:grid-cols-3">
              {PREDEFINED_TEMPLATES.map((p) => (
                <div key={p.name} class="group relative rounded-xl border border-outline-variant/10 bg-surface-container-low p-4 transition-all hover:border-primary/20 hover:shadow-sm">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="text-sm font-bold text-on-surface">{p.name}</h4>
                    <button
                      class="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick$={() => { newName.value = p.name; newTemplate.value = p.template; showCreateForm.value = true; }}
                    >
                      Use
                    </button>
                  </div>
                  <pre class="text-[10px] text-tertiary/70 leading-relaxed line-clamp-4 font-mono">{p.template}</pre>
                </div>
              ))}
            </div>
          </div>

          {/* Your Templates Header */}
          <div class="flex items-center justify-between">
            <h3 class="text-[10px] font-bold uppercase tracking-[0.15em] text-tertiary">Your Templates ({data.value.templates.length})</h3>
            <button
              onClick$={() => { showCreateForm.value = true; newName.value = ""; newTemplate.value = ""; }}
              class="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              <PlusIcon class="w-3.5 h-3.5" /> New
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm.value && (
            <Form action={createAction} class="rounded-xl border border-primary/20 bg-surface-container-low p-5 space-y-4">
              <h3 class="text-sm font-bold text-on-surface">Create Template</h3>
              <input type="hidden" name="cluster_id" value={data.value.clusterId} />
              <div>
                <label class="text-[10px] font-bold uppercase tracking-[0.15em] text-tertiary block mb-1">Name</label>
                <input
                  name="name"
                  bind:value={newName}
                  class="w-full rounded-lg bg-black/40 border border-outline-variant/15 px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary/50 transition-colors placeholder:text-tertiary/40"
                  placeholder="e.g., RAG Context"
                  required
                />
              </div>
              <div>
                <label class="text-[10px] font-bold uppercase tracking-[0.15em] text-tertiary block mb-1">Template</label>
                <p class="text-xs text-tertiary/70 mb-2">
                  Markers:{' '}
                  <code class="text-primary text-[10px] bg-primary/10 px-1 rounded">{'{facts limit=N}'}</code>{' '}
                  <code class="text-primary text-[10px] bg-primary/10 px-1 rounded">{'{user_summary}'}</code>{' '}
                  <code class="text-primary text-[10px] bg-primary/10 px-1 rounded">{'{graph_neighbors n=N}'}</code>
                </p>
                <textarea
                  name="template"
                  bind:value={newTemplate}
                  rows={5}
                  class="w-full rounded-lg bg-black/40 border border-outline-variant/15 px-3.5 py-2.5 text-sm font-mono text-on-surface outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-tertiary/40"
                  placeholder="{user_summary}{facts limit=10}"
                  required
                />
              </div>
              <div class="flex gap-3">
                <button type="submit" disabled={createAction.isRunning} class="rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm">
                  {createAction.isRunning ? "Saving..." : "Save Template"}
                </button>
                <button type="button" onClick$={() => showCreateForm.value = false} class="rounded-lg border border-outline-variant/15 px-5 py-2.5 text-xs font-bold text-tertiary hover:bg-surface-container transition-colors">
                  Cancel
                </button>
              </div>
            </Form>
          )}

          {/* Template List */}
          {data.value.templates.length === 0 && !showCreateForm.value && (
            <div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/10 py-12 text-center">
              <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-surface-container-high text-tertiary mb-3">
                <FileTextIcon class="w-5 h-5" />
              </div>
              <p class="text-sm font-medium text-tertiary">No custom templates yet.</p>
              <p class="text-xs text-tertiary/60 mt-1">Create one above or use a built-in template.</p>
            </div>
          )}

          <div class="space-y-2">
            {data.value.templates.map((t: any) => (
              <div key={t.id} class="flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container-low p-4 transition-all hover:border-outline-variant/20">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="flex items-center justify-center h-6 w-6 rounded bg-surface-container-high text-primary">
                      <FileTextIcon class="w-3 h-3" />
                    </div>
                    <h4 class="text-sm font-bold text-on-surface">{t.name}</h4>
                  </div>
                  <pre class="text-xs text-tertiary/60 font-mono truncate pl-8">{t.template.slice(0, 100)}</pre>
                </div>
                <Form action={deleteAction} class="shrink-0 ml-3">
                  <input type="hidden" name="id" value={t.id} />
                  <button type="submit" class="flex h-8 w-8 items-center justify-center rounded-lg text-tertiary hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete template">
                    <Trash2Icon class="w-3.5 h-3.5" />
                  </button>
                </Form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Settings | ALETHEIADB",
  description: "Manage your account settings.",
  pathname: "/platform/settings",
  noindex: true,
});
