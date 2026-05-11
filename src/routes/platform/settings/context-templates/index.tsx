import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, routeAction$, Form, type DocumentHead } from "@builder.io/qwik-city";
import { ArrowLeftIcon, PlusIcon, Trash2Icon, CopyIcon, CheckIcon } from "lucide-qwik";
import { buildSeoHead } from "~/lib/seo";
import { setPrivateNoStore } from "~/lib/cache";
import type { RequestHandler } from "@builder.io/qwik-city";
import { requireAuth } from "~/lib/auth";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { getContextTemplates, createContextTemplate, deleteContextTemplate } from "~/lib/context-templates";

export const onRequest: RequestHandler = (event) => { setPrivateNoStore(event); };

export const useTemplateData = routeLoader$(async (event) => {
  const user = requireAuth(event);
  const supabase = getAdminSupabaseClient(event.env);
  const { data: clusters } = await supabase.from("clusters").select("*").eq("user_id", user.user_id);
  const clusterId = clusters?.[0]?.id || "";
  const templates = clusterId ? await getContextTemplates(event, clusterId) : [];
  return { templates, clusterId, clusters: clusters || [] };
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

const PREDEFINED = [
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
    template: "```\nUSER PROFILE\n%{user_summary}\n\nRELATED ENTITIES\n%{related_entities}\n\nSUPPORTING FACTS (limit 15)\n%{facts limit=15}\n\nKNOWLEDGE GRAPH CONTEXT\n%{graph_neighbors n=10}\n```",
  },
];

export default component$(() => {
  const data = useTemplateData();
  const createAction = useCreateTemplate();
  const deleteAction = useDeleteTemplate();
  const showCreate = useSignal(false);
  const newName = useSignal("");
  const newTemplate = useSignal("");
  const selectedCluster = useSignal(data.value.clusterId);
  const copied = useSignal("");

  return (
    <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
      <main class="flex-1 overflow-y-auto p-8 lg:p-12 mb-20 max-w-4xl mx-auto w-full pt-[104px]">
        <h1 class="font-headline text-3xl font-extrabold mb-8">Context Templates</h1>
        <p class="text-tertiary mb-8">Define how memories are formatted when sent to your LLM. Use markers like <code class="text-primary text-xs">{'%{facts limit=10}'}</code> to control output.</p>

        {/* Predefined templates */}
        <div class="mb-8">
          <h3 class="text-sm font-bold uppercase tracking-widest text-tertiary mb-4">Built-in Templates</h3>
          <div class="grid gap-3">
            {PREDEFINED.map((p) => (
              <div key={p.name} class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold">{p.name}</h4>
                  <button class="text-xs text-primary font-bold hover:underline" onClick$={() => { newName.value = p.name; newTemplate.value = p.template; showCreate.value = true; }}>Use This</button>
                </div>
                <pre class="text-xs text-tertiary bg-black/40 rounded-lg p-3 overflow-x-auto">{p.template}</pre>
              </div>
            ))}
          </div>
        </div>

        {/* Create form */}
        {showCreate.value && (
          <Form action={createAction} class="rounded-2xl border border-primary/20 bg-surface-container-low p-6 mb-8 space-y-4">
            <h3 class="font-bold text-lg">Create Template</h3>
            <input type="hidden" name="cluster_id" value={selectedCluster.value} />
            <div>
              <label class="text-xs font-bold uppercase tracking-widest text-tertiary block mb-1">Name</label>
              <input name="name" bind:value={newName} class="w-full rounded-xl bg-black/40 border border-outline-variant/20 px-4 py-3 text-sm focus:outline-none focus:border-primary" placeholder="e.g., RAG Context" required />
            </div>
            <div>
              <label class="text-xs font-bold uppercase tracking-widest text-tertiary block mb-1">Template</label>
              <p class="text-xs text-tertiary mb-2">Available markers: <code>{'%{facts limit=N}'}</code>, <code>{'%{user_summary}'}</code>, <code>{'%{graph_neighbors n=N}'}</code>, <code>{'%{temporal_range days=N}'}</code>, <code>{'%{related_entities}'}</code></p>
              <textarea name="template" bind:value={newTemplate} rows={6} class="w-full rounded-xl bg-black/40 border border-outline-variant/20 px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary resize-none" placeholder="%{user_summary}%{facts limit=10}" required />
            </div>
            <div class="flex gap-3">
              <button type="submit" disabled={createAction.isRunning} class="rounded-xl bg-primary text-on-primary px-6 py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50">{createAction.isRunning ? "Saving..." : "Save Template"}</button>
              <button type="button" onClick$={() => showCreate.value = false} class="rounded-xl border border-outline-variant/20 px-6 py-3 text-sm font-bold text-tertiary hover:bg-surface-container-high">Cancel</button>
            </div>
          </Form>
        )}

        {/* Saved templates */}
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold uppercase tracking-widest text-tertiary">Your Templates ({data.value.templates.length})</h3>
          <button onClick$={() => { showCreate.value = true; newName.value = ""; newTemplate.value = ""; }} class="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20">
            <PlusIcon class="w-4 h-4" /> New
          </button>
        </div>

        {data.value.templates.length === 0 && !showCreate.value && (
          <p class="text-sm text-tertiary text-center py-8">No custom templates yet. Create one above or use a built-in template.</p>
        )}

        <div class="space-y-2">
          {data.value.templates.map((t: any) => (
            <div key={t.id} class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4 flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-sm">{t.name}</h4>
                <pre class="text-xs text-tertiary mt-1 truncate">{t.template.slice(0, 80)}...</pre>
              </div>
              <Form action={deleteAction} class="flex gap-2">
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" class="p-2 text-tertiary hover:text-red-400 transition-colors"><Trash2Icon class="w-4 h-4" /></button>
              </Form>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({ title: "Context Templates | ALETHEIA", pathname: "/platform/settings/context-templates", noindex: true });
