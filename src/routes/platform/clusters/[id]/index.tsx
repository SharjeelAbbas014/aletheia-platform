import { component$ } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import { buildSeoHead } from "~/lib/seo";
import { setPrivateNoStore } from "~/lib/cache";
import type { RequestHandler } from "@builder.io/qwik-city";
import {
  ArrowLeftIcon,
  RocketIcon,
  CopyIcon,
  KeyIcon,
  NetworkIcon,
  BarChart3Icon,
  ActivityIcon,
  DatabaseIcon,
  UsersIcon,
  FileTextIcon,
} from "lucide-qwik";
import { requireAuth } from "~/lib/auth";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { getCoreClusterStats } from "~/lib/aletheia-core";

export const onRequest: RequestHandler = (event) => {
  setPrivateNoStore(event);
};

export const useClusterDetail = routeLoader$(async (event) => {
  const user = requireAuth(event);
  const clusterId = event.params.id;
  const supabase = getAdminSupabaseClient(event.env);
  const { data: cluster } = await supabase
    .from("clusters")
    .select("*")
    .eq("id", clusterId)
    .single();
  if (!cluster || cluster.user_id !== user.user_id) throw event.error(404, "Not found");
  const coreStats = await getCoreClusterStats(cluster.id);
  return { cluster, coreStats, user };
});

export default component$(() => {
  const data = useClusterDetail();
  const cluster = data.value.cluster as any;
  const stats = data.value.coreStats as any;

  const formatNum = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);
  const formatBytes = (b: number) => {
    if (!b) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
      <main class="flex-1 overflow-y-auto p-8 lg:p-12 mb-20 max-w-5xl mx-auto w-full pt-[104px]">
        <header class="mb-8 flex flex-col gap-4">
          <Link href="/platform" class="text-tertiary hover:text-primary flex items-center gap-1 transition-colors w-fit">
            <ArrowLeftIcon class="w-4 h-4" />
            Mission Control
          </Link>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <h1 class="font-headline text-4xl font-extrabold tracking-tighter text-on-surface">{cluster.name}</h1>
                <span class={`rounded px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-widest ${
                  cluster.status === "active" ? "bg-green-500/10 text-green-400" :
                  cluster.status === "provisioning" ? "bg-amber-500/10 text-amber-400" :
                  "bg-red-500/10 text-red-400"
                }`}>{cluster.status}</span>
                <span class="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary font-bold uppercase tracking-widest">{cluster.tier?.replace("_", " ") || "Fractional"}</span>
              </div>
              <p class="text-tertiary font-mono text-sm">Cluster ID: {cluster.id.slice(0, 16)}...</p>
            </div>
            <form method="post" action="/api/billing/checkout">
              <input type="hidden" name="tier" value="dedicated_l4" />
              <button type="submit" class="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-6 py-3 font-bold text-sm text-orange-400 transition-all hover:bg-orange-500 hover:text-white shadow-lg">
                <RocketIcon class="w-4 h-4" />
                Migrate to Dedicated
              </button>
            </form>
          </div>
        </header>

        {/* Tab Navigation */}
        <div class="flex gap-1 border-b border-outline-variant/10 mb-8">
          <Link href={`/platform/clusters/${cluster.id}`} class="px-4 py-3 text-sm font-bold border-b-2 border-primary text-primary">Overview</Link>
          <Link href={`/platform/clusters/${cluster.id}/graph`} class="px-4 py-3 text-sm font-bold text-tertiary hover:text-on-surface border-b-2 border-transparent hover:border-outline-variant/30 transition-colors">
            <NetworkIcon class="w-4 h-4 inline mr-1.5" />Graph
          </Link>
          <Link href={`/platform/clusters/${cluster.id}/analytics`} class="px-4 py-3 text-sm font-bold text-tertiary hover:text-on-surface border-b-2 border-transparent hover:border-outline-variant/30 transition-colors">
            <BarChart3Icon class="w-4 h-4 inline mr-1.5" />Analytics
          </Link>
        </div>

        {/* Stats Grid */}
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
            <div class="flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-widest mb-2">
              <DatabaseIcon class="w-4 h-4" /> Memories
            </div>
            <p class="text-3xl font-extrabold">{stats ? formatNum(stats.memory_count) : "—"}</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
            <div class="flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-widest mb-2">
              <UsersIcon class="w-4 h-4" /> Entities
            </div>
            <p class="text-3xl font-extrabold">{stats ? formatNum(stats.entity_count) : "—"}</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
            <div class="flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-widest mb-2">
              <FileTextIcon class="w-4 h-4" /> Facts
            </div>
            <p class="text-3xl font-extrabold">{stats ? formatNum(stats.fact_count) : "—"}</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
            <div class="flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-widest mb-2">
              <ActivityIcon class="w-4 h-4" /> Storage
            </div>
            <p class="text-3xl font-extrabold">{stats ? formatBytes(stats.storage_bytes) : "—"}</p>
          </div>
        </section>

        {/* Connection Details */}
        <section class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 mb-8">
          <h2 class="text-lg font-bold mb-4">Connection Details</h2>
          <div class="space-y-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-tertiary mb-1">Endpoint URL</p>
              <div class="flex items-center gap-2 rounded-lg bg-black/40 p-3 font-mono text-sm text-primary border border-primary/20">
                <span class="flex-1 truncate">{cluster.endpoint_url || "https://api.aletheiadb.com/api"}</span>
                <button class="p-1 hover:bg-primary/20 rounded transition-colors text-primary" onClick$={() => navigator.clipboard.writeText(cluster.endpoint_url || "https://api.aletheiadb.com/api")}>
                  <CopyIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-tertiary mb-1">Cluster API Key</p>
              <div class="flex items-center gap-2 rounded-lg bg-black/40 p-3 font-mono text-sm text-on-surface border border-outline-variant/20">
                <span class="flex-1 truncate text-tertiary">••••••••••••••••••••••••••••••••</span>
              </div>
              <p class="text-xs text-tertiary mt-1">Manage keys in Mission Control.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Cluster Detail | ALETHEIA",
  description: "Manage your Aletheia cluster.",
  pathname: "/platform/clusters/[id]",
  noindex: true
});
