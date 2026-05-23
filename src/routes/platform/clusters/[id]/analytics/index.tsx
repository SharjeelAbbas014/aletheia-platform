import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, Link, type DocumentHead } from "@builder.io/qwik-city";
import { ArrowLeftIcon } from "lucide-qwik";
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
  const { data: cluster } = await supabase.from("clusters").select("*").eq("id", clusterId).single();
  const { data: usage } = await supabase
    .from("usage_daily")
    .select("*")
    .eq("cluster_id", clusterId)
    .order("date", { ascending: false })
    .limit(30);
  const totals = (usage || []).reduce(
    (acc: any, d: any) => ({
      request_count: acc.request_count + (d.request_count || 0),
      ingest_count: acc.ingest_count + (d.ingest_count || 0),
      query_count: acc.query_count + (d.query_count || 0),
    }),
    { request_count: 0, ingest_count: 0, query_count: 0 }
  );
  return { cluster, usage: (usage || []).reverse(), totals, user };
});

export default component$(() => {
  const data = useClusterData();
  const cluster = data.value.cluster as any;
  const usage = data.value.usage as any[];
  const totals = data.value.totals as any;
  const days = useSignal(14);

  const maxVal = Math.max(...usage.map((d: any) => d.query_count || 0), 1);

  return (
    <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
      <main class="flex-1 overflow-y-auto p-8 lg:p-12 mb-20 max-w-5xl mx-auto w-full pt-[104px]">
        <header class="mb-8 flex items-start justify-between">
          <div>
            <Link href={`/platform/clusters/${cluster?.id}`} class="text-tertiary hover:text-primary flex items-center gap-1 transition-colors w-fit">
              <ArrowLeftIcon class="w-4 h-4" />
              {cluster?.name || "Cluster"}
            </Link>
            <h1 class="font-headline text-3xl font-extrabold tracking-tighter text-on-surface mt-2">Analytics</h1>
          </div>
          <select
            value={days.value}
            onChange$={(_, el: HTMLSelectElement) => { days.value = parseInt(el.value); }}
            class="rounded-xl bg-black/40 border border-outline-variant/20 px-4 py-2 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </header>

        {/* Stats Cards */}
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
            <p class="text-sm text-tertiary font-bold uppercase tracking-widest mb-1">Requests</p>
            <p class="text-3xl font-extrabold">{totals.request_count.toLocaleString()}</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
            <p class="text-sm text-tertiary font-bold uppercase tracking-widest mb-1">Queries</p>
            <p class="text-3xl font-extrabold">{totals.query_count.toLocaleString()}</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
            <p class="text-sm text-tertiary font-bold uppercase tracking-widest mb-1">Ingests</p>
            <p class="text-3xl font-extrabold">{totals.ingest_count.toLocaleString()}</p>
          </div>
        </div>

        {/* Bar Chart */}
        <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
          <h3 class="text-lg font-bold mb-4">Queries Over Time</h3>
          {usage.length === 0 ? (
            <p class="text-sm text-tertiary text-center py-8">No usage data for this period.</p>
          ) : (
            <div class="space-y-1">
              {usage.filter((_: any, i: number) => i >= usage.length - days.value).map((d: any) => (
                <div key={d.date} class="flex items-center gap-3 text-sm">
                  <span class="w-24 text-tertiary shrink-0 font-mono text-xs">
                    {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <div class="flex-1 h-6 rounded bg-black/40 overflow-hidden">
                    <div
                      class="h-full rounded bg-primary/60 transition-all"
                      style={{ width: `${((d.query_count || 0) / maxVal) * 100}%` }}
                    />
                  </div>
                  <span class="w-16 text-right font-mono text-xs text-tertiary">{d.query_count || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Analytics | ALETHEIADB",
  description: "View usage analytics for your cluster.",
  pathname: "/platform/clusters/[id]/analytics",
  noindex: true
});
