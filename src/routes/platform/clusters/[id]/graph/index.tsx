import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, Link, type DocumentHead } from "@builder.io/qwik-city";
import { ArrowLeftIcon, SearchIcon, NetworkIcon } from "lucide-qwik";
import { buildSeoHead } from "~/lib/seo";
import { setPrivateNoStore } from "~/lib/cache";
import type { RequestHandler } from "@builder.io/qwik-city";
import { requireAuth } from "~/lib/auth";
import { getAdminSupabaseClient } from "~/lib/supabase";

export const onRequest: RequestHandler = (event) => {
  setPrivateNoStore(event);
};

export const useClusterData = routeLoader$(async (event) => {
  const user = requireAuth(event);
  const clusterId = event.params.id;
  const supabase = getAdminSupabaseClient(event.env);
  const { data } = await supabase.from("clusters").select("*").eq("id", clusterId).single();
  return { cluster: data, user };
});

export default component$(() => {
  const data = useClusterData();
  const cluster = data.value.cluster as any;
  const searchEntity = useSignal("");
  const nodes = useSignal<{ id: string; label: string; kind: string }[]>([]);
  const loading = useSignal(false);
  const error = useSignal("");

  const searchGraph = async () => {
    if (!searchEntity.value.trim()) return;
    loading.value = true;
    error.value = "";
    try {
      const proxyBase = typeof window !== "undefined" ? `${window.location.origin}/api` : "/api";
      const entityId = cluster?.id || "";
      const res = await fetch(`${proxyBase}/graph/walk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "platform" },
        body: JSON.stringify({ entity: searchEntity.value, depth: 2, entity_id: entityId }),
      });
      const result = await res.json();
      if (result.nodes) {
        nodes.value = result.nodes.map((n: any) => ({
          id: n.id,
          label: n.label || n.id,
          kind: n.kind,
        }));
      } else if (result.error) {
        error.value = result.error;
      }
    } catch {
      error.value = "Could not reach the graph. Ensure the Aletheia engine is running.";
    }
    loading.value = false;
  };

  return (
    <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
      <main class="flex-1 overflow-y-auto p-8 lg:p-12 mb-20 max-w-5xl mx-auto w-full pt-[104px]">
        <header class="mb-8">
          <Link href={`/platform/clusters/${cluster?.id}`} class="text-tertiary hover:text-primary flex items-center gap-1 transition-colors w-fit">
            <ArrowLeftIcon class="w-4 h-4" />
            {cluster?.name || "Cluster"}
          </Link>
          <h1 class="font-headline text-3xl font-extrabold tracking-tighter text-on-surface mt-2">Graph Explorer</h1>
        </header>

        <div class="flex gap-3 mb-6">
          <div class="relative flex-1">
            <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
            <input
              type="text"
              bind:value={searchEntity}
              onKeyDown$={(e: any) => e.key === "Enter" && searchGraph()}
              placeholder="Search an entity (e.g., Alice, coffee)..."
              class="w-full rounded-xl bg-black/40 border border-outline-variant/20 pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick$={searchGraph}
            disabled={loading.value}
            class="rounded-xl bg-primary text-on-primary px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading.value ? "Searching..." : "Explore"}
          </button>
        </div>

        {error.value && <p class="text-sm text-red-400 mb-4">{error.value}</p>}

        <div class="grid lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 rounded-2xl border border-outline-variant/10 bg-surface-container-low h-[500px] flex items-center justify-center">
            {nodes.value.length === 0 ? (
              <div class="text-center text-tertiary">
                <NetworkIcon class="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p class="text-sm">Search an entity to explore the knowledge graph</p>
              </div>
            ) : (
              <div class="w-full h-full p-4 overflow-auto">
                <pre class="text-xs text-tertiary">{JSON.stringify(nodes.value.slice(0, 50), null, 2)}</pre>
              </div>
            )}
          </div>

          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
            <h3 class="text-sm font-bold uppercase tracking-widest text-tertiary mb-3">Nodes</h3>
            {nodes.value.length === 0 ? (
              <p class="text-sm text-tertiary">No nodes loaded yet.</p>
            ) : (
              <div class="space-y-1 max-h-[460px] overflow-auto">
                {nodes.value.map((node) => (
                  <div key={node.id} class="flex items-center gap-2 text-sm py-1">
                    <span class={`w-2 h-2 rounded-full ${
                      node.kind === "entity" ? "bg-blue-400" :
                      node.kind === "fact" ? "bg-green-400" :
                      node.kind === "topic" ? "bg-purple-400" : "bg-gray-500"
                    }`} />
                    <span class="truncate flex-1">{node.label}</span>
                    <span class="text-xs text-tertiary">{node.kind}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Graph Explorer | ALETHEIA",
  description: "Explore the knowledge graph of your cluster.",
  pathname: "/platform/clusters/[id]/graph",
  noindex: true
});
