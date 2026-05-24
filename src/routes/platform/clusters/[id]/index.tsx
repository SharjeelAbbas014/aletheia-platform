import { component$, useVisibleTask$, useSignal } from "@builder.io/qwik";
import { routeLoader$, routeAction$, Form, Link, type DocumentHead, useLocation, useNavigate } from "@builder.io/qwik-city";
import { buildSeoHead } from "~/lib/seo";
import { setPrivateNoStore } from "~/lib/cache";
import type { RequestHandler } from "@builder.io/qwik-city";
import { getProvisioningSteps } from "~/lib/azure";
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
  ServerIcon,
  RefreshCwIcon,
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
  if (!supabase) throw event.error(500, "Database connection offline");

  const { data: cluster } = await supabase
    .from("clusters")
    .select("*")
    .eq("id", clusterId)
    .single();
  if (!cluster || cluster.user_id !== user.user_id) throw event.error(404, "Not found");

  const coreStats = await getCoreClusterStats(cluster.id);
  return { cluster, coreStats, user };
});
export const useDeleteCluster = routeAction$(async (data, event) => {
  const user = requireAuth(event);
  const clusterId = String(data.cluster_id || "");
  const supabase = getAdminSupabaseClient(event.env);
  if (!supabase) throw event.error(500, "Database connection offline");

  // 1. Get cluster detail to verify ownership
  const { data: cluster } = await supabase
    .from("clusters")
    .select("user_id, tier, region, status")
    .eq("id", clusterId)
    .single();

  if (!cluster || cluster.user_id !== user.user_id) {
    throw event.error(404, "Cluster not found");
  }

  // 2. Delete Azure VM if dedicated tier
  if (cluster.tier !== "fractional" && cluster.region && cluster.region !== "shared") {
    const supabaseUrl = (import.meta.env.PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
    const functionUrl = `${supabaseUrl}/functions/v1/cleanup-vm`;

    try {
      const fnRes = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: event.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
        },
        body: JSON.stringify({ clusterId, region: cluster.region }),
      });
      if (!fnRes.ok) {
        const err = await fnRes.json();
        console.error(`Azure cleanup failed for ${clusterId}: ${err.error}`);
      }
    } catch (fnErr: any) {
      console.error(`Azure cleanup call failed for ${clusterId}:`, fnErr.message);
    }
  }

  // 3. Cancel Stripe subscription if it's a dedicated VM and user has subscription
  if (cluster.tier !== "fractional") {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", user.user_id)
      .maybeSingle();

    if (sub?.stripe_subscription_id) {
      try {
        const stripeKey = event.env.get("STRIPE_SECRET_KEY") || "";
        const isMockStripe = !stripeKey || stripeKey.trim().startsWith("sk_test_...");
        if (!isMockStripe) {
          const { getStripeClient } = await import("~/lib/stripe");
          const stripe = getStripeClient(event.env);
          await stripe.subscriptions.cancel(sub.stripe_subscription_id);
        }
      } catch (stripeErr) {
        console.error("Failed to cancel Stripe subscription during cluster deletion:", stripeErr);
      }
    }

    // Downgrade subscription record to fractional/canceled
    await supabase
      .from("subscriptions")
      .update({
        tier: "fractional",
        status: "canceled",
        vm_size: null,
        vm_monthly_price: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.user_id);
  }

  // 4. Soft delete the cluster
  const { error } = await supabase
    .from("clusters")
    .update({ status: "deleted" })
    .eq("id", clusterId);

  if (error) {
    throw event.error(500, "Failed to delete cluster");
  }

  throw event.redirect(302, "/platform");
});

export const useRetryProvision = routeAction$(async (data, event) => {
  const user = requireAuth(event);
  const clusterId = String(data.cluster_id || "");
  const region = String(data.region || "westus2");
  const supabase = getAdminSupabaseClient(event.env);
  if (!supabase) throw event.error(500, "Database connection offline");

  const { data: cluster } = await supabase
    .from("clusters")
    .select("id, user_id, tier, status")
    .eq("id", clusterId)
    .maybeSingle();

  if (!cluster || cluster.user_id !== user.user_id) {
    throw event.error(404, "Cluster not found");
  }

  if (cluster.status === "active") {
    throw event.error(400, "Cluster is already active");
  }

  const vmSizeMap: Record<string, string> = {
    azure_micro: "Standard_D2s_v5",
    azure_standard: "Standard_D2as_v5",
    azure_pro: "Standard_D4s_v5",
    azure_scale: "Standard_D4as_v5",
    azure_gpu: "Standard_NC4as_T4",
    dedicated_l4: "Standard_NV6as_v4",
  };

  const tier = cluster.tier || "azure_standard";
  const vmSize = vmSizeMap[tier] || "Standard_D2s_v5";
  const storageGb = parseInt(String(data.storage_gb || "50"), 10);

  await supabase.from("clusters").update({
    status: "provisioning",
    region,
  }).eq("id", clusterId);

  const supabaseUrl = (import.meta.env.PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const functionUrl = `${supabaseUrl}/functions/v1/provision-vm`;

  try {
    const fnRes = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: event.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      },
      body: JSON.stringify({ clusterId, tier, region, vmSize, storageGb }),
    });

    const fnResult = await fnRes.json();
    if (fnResult.submitted) {
      await supabase.from("clusters").update({ region }).eq("id", clusterId);
      return { success: true, region, steps: fnResult.steps || [] };
    } else {
      await supabase.from("clusters").update({ status: "failed" }).eq("id", clusterId);
      return { success: false, error: fnResult.error || "Provisioning failed", steps: fnResult.steps || [] };
    }
  } catch (fnErr: any) {
    await supabase.from("clusters").update({ status: "failed" }).eq("id", clusterId);
    return { success: false, error: fnErr.message || "Edge function call failed", steps: [] };
  }
});

export default component$(() => {
  const data = useClusterDetail();
  const deleteAction = useDeleteCluster();
  const retryAction = useRetryProvision();
  const cluster = data.value.cluster as any;
  const stats = data.value.coreStats as any;
  const retrying = useSignal(false);

  const vmSize = {
    azure_micro: "Standard_D2s_v5",
    azure_standard: "Standard_D2as_v5",
    azure_pro: "Standard_D4s_v5",
    azure_scale: "Standard_D4as_v5",
    azure_gpu: "Standard_NC4as_T4",
    dedicated_l4: "Standard_NV6as_v4",
  }[cluster.tier as string] || "Standard_D2s_v5";

  const loc = useLocation();
  const nav = useNavigate();

  useVisibleTask$(({ cleanup }) => {
    if (cluster.status === "provisioning") {
      const interval = setInterval(() => {
        nav(loc.url.pathname);
      }, 3000);
      cleanup(() => clearInterval(interval));
    }
  });

  const formatNum = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);
  const formatBytes = (b: number) => {
    if (!b) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (cluster.status === "provisioning") {
    const createdMs = new Date(cluster.created_at).getTime();
    const elapsedMin = Math.floor((Date.now() - createdMs) / 60000);
    const stuck = elapsedMin > 3;
    const platformUrl = loc.url.origin;
    const activateCurl = `curl -X POST ${platformUrl}/api/clusters/${cluster.id}/activate \\\n  -H "x-admin-key: 82a2cd542b86763b5941fba04db9802928c53a27256fcccb64e12f414f69826a" \\\n  -H "Content-Type: application/json" \\\n  -d '{"ip_address": "YOUR_VM_PUBLIC_IP"}'`;

    return (
      <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
        <main class="flex-grow flex items-center justify-center p-8 lg:p-12 mb-20 max-w-2xl mx-auto w-full pt-[104px]">
          <div class="w-full">
            <header class="mb-8 text-center">
              <div class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 mb-4 animate-pulse">
                <ActivityIcon class="w-6 h-6" />
              </div>
              <h1 class="font-headline text-3xl font-extrabold tracking-tighter text-on-surface">Provisioning Dedicated VM</h1>
              <p class="text-tertiary mt-2 text-sm">Cluster Name: <span class="text-on-surface font-semibold">{cluster.name}</span></p>
              <p class="text-[10px] text-tertiary mt-1">Region: {cluster.region?.toUpperCase()} • VM Size: {vmSize} • Storage: {cluster.storage_gb || 10} GB SSD</p>
            </header>

            <section class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 mb-6 shadow-lg shadow-black/20">
              <h3 class="text-sm font-bold mb-2 text-on-surface">Waiting for Server Boot</h3>
              <p class="text-xs text-tertiary mb-6 leading-relaxed">
                The virtual machine instance is being allocated in Azure. Once the VM boots up and starts the AletheiaDB engine, it must send an activation signal to our API gateway to transition this cluster to active.
              </p>

              <div class="border-t border-outline-variant/10 pt-4">
                <p class="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Activation Callback Command</p>
                <p class="text-[11px] text-tertiary mb-3 leading-relaxed">
                  Run this command from your VM bootstrap script (cloud-init) or manually to report your server's public IP and activate it:
                </p>
                <div class="flex items-start gap-2 rounded-lg bg-black/40 p-3 font-mono text-[11px] text-amber-400 border border-amber-500/20 whitespace-pre overflow-x-auto">
                  <code class="flex-1">{activateCurl}</code>
                  <button 
                    class="p-1 hover:bg-amber-500/20 rounded transition-colors text-amber-400 self-start shrink-0" 
                    onClick$={() => navigator.clipboard.writeText(activateCurl)}
                  >
                    <CopyIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {stuck && (
              <section class="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 mb-6">
                <h3 class="text-sm font-bold text-red-400 mb-2">Provisioning Taking Longer Than Expected</h3>
                <p class="text-xs text-tertiary mb-4 leading-relaxed">
                  This cluster has been provisioning for {elapsedMin} minutes. If you selected a region with limited capacity, the VM size may not be available. Try a different region like <span class="font-semibold text-on-surface">West US 2</span>.
                </p>
                <Form action={retryAction} class="flex flex-col gap-3">
                  <input type="hidden" name="cluster_id" value={cluster.id} />
                  <input type="hidden" name="storage_gb" value={cluster.storage_gb || 50} />
                  <div class="flex items-end gap-3">
                    <div class="flex-1">
                      <label class="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1 block">Region</label>
                      <select name="region" class="w-full rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-on-surface text-sm outline-none focus:border-primary">
                        <option value="westus2" selected>West US 2 (Washington)</option>
                        <option value="eastus">East US (Virginia)</option>
                        <option value="westeurope">West Europe (Netherlands)</option>
                        <option value="northeurope">North Europe (Ireland)</option>
                        <option value="southeastasia">Southeast Asia (Singapore)</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={retrying.value}
                      class="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white transition-all flex items-center gap-2 shrink-0"
                      onClick$={() => { retrying.value = true; }}
                    >
                      <RefreshCwIcon class="w-3.5 h-3.5" />
                      Retry Provisioning
                    </button>
                  </div>
                </Form>
                {retryAction.value?.steps && (retryAction.value.steps as string[]).length > 0 && (
                  <div class="mt-4 rounded-lg bg-black/40 p-3 border border-outline-variant/20">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-2">Diagnostic Log</p>
                    <ul class="text-[11px] font-mono text-tertiary space-y-1">
                      {(retryAction.value.steps as string[]).map((step: string, i: number) => (
                        <li key={i} class="flex items-start gap-2">
                          <span class="text-primary shrink-0">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                    {retryAction.value.error && (
                      <p class="text-[11px] font-mono text-red-400 mt-2 border-t border-outline-variant/10 pt-2">
                        Error: {retryAction.value.error as string}
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}

            <div class="flex justify-between items-center px-2">
              <Link href="/platform" class="text-xs font-bold text-tertiary hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeftIcon class="w-3.5 h-3.5" /> Return to Mission Control
              </Link>
              <button 
                onClick$={() => nav(loc.url.pathname)} 
                class="rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white px-4 py-2 text-xs font-bold text-primary transition-all"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (cluster.status === "failed") {
    return (
      <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
        <main class="flex-grow flex items-center justify-center p-8 lg:p-12 mb-20 max-w-2xl mx-auto w-full pt-[104px]">
          <div class="w-full text-center">
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 mb-4">
              <ActivityIcon class="w-6 h-6" />
            </div>
            <h1 class="font-headline text-3xl font-extrabold tracking-tighter text-on-surface mb-2">Provisioning Failed</h1>
            <p class="text-tertiary text-sm mb-6">
              The Azure VM could not be created for cluster <span class="font-semibold text-on-surface">{cluster.name}</span>.
            </p>
            <div class="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 mb-6 text-left">
              <p class="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">What went wrong</p>
              <p class="text-sm text-tertiary leading-relaxed">
                The VM size <code class="font-mono text-amber-400">{vmSize}</code> is not available in <span class="font-semibold text-on-surface">{(cluster.region || "westus2").toUpperCase()}</span>.
                This is a capacity restriction in that Azure region — your subscription and payment are valid.
              </p>
            </div>
            <div class="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-8 text-left">
              <p class="text-xs font-bold uppercase tracking-widest text-primary mb-2">Retry with a different region</p>
              <Form action={retryAction} class="flex items-end gap-3">
                <input type="hidden" name="cluster_id" value={cluster.id} />
                <input type="hidden" name="storage_gb" value={cluster.storage_gb || 50} />
                <div class="flex-1">
                  <select name="region" class="w-full rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-on-surface text-sm outline-none focus:border-primary">
                    <option value="westus2" selected>West US 2 (Washington)</option>
                    <option value="eastus">East US (Virginia)</option>
                    <option value="westeurope">West Europe (Netherlands)</option>
                    <option value="northeurope">North Europe (Ireland)</option>
                    <option value="southeastasia">Southeast Asia (Singapore)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={retrying.value}
                  class="rounded-lg bg-primary hover:bg-primary/90 px-4 py-2 text-sm font-bold text-on-primary transition-all flex items-center gap-2 shrink-0"
                  onClick$={() => { retrying.value = true; }}
                >
                  <RefreshCwIcon class="w-3.5 h-3.5" />
                  Retry Provisioning
                </button>
              </Form>
              {retryAction.value?.steps && (retryAction.value.steps as string[]).length > 0 && (
                <div class="mt-4 rounded-lg bg-black/40 p-3 border border-outline-variant/20">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-2">Diagnostic Log</p>
                  <ul class="text-[11px] font-mono text-tertiary space-y-1">
                    {(retryAction.value.steps as string[]).map((step: string, i: number) => (
                      <li key={i} class="flex items-start gap-2">
                        <span class="text-primary shrink-0">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                  {retryAction.value.error && (
                    <p class="text-[11px] font-mono text-red-400 mt-2 border-t border-outline-variant/10 pt-2">
                      Error: {retryAction.value.error as string}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div class="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/platform" class="rounded-lg border border-outline-variant/20 px-6 py-3 font-bold text-sm text-on-surface transition-all hover:bg-surface-container-high">
                Back to Mission Control
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
            {cluster.tier === "fractional" ? (
              <Link 
                href={`/platform/clusters/new?tier=dedicated_l4`} 
                class="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-6 py-3 font-bold text-sm text-orange-400 transition-all hover:bg-orange-500 hover:text-white shadow-lg"
              >
                <RocketIcon class="w-4 h-4" />
                Migrate to Dedicated
              </Link>
            ) : (
              <div class="flex items-center gap-3 rounded-xl bg-surface-container-low px-5 py-3 border border-outline-variant/10">
                <ServerIcon class="w-5 h-5 text-primary" />
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary">VM Status</p>
                  <p class="text-sm font-bold text-green-400">Deployed</p>
                </div>
              </div>
            )}
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

        {/* VM Specs (dedicated clusters only) */}
        {cluster.tier !== "fractional" && (
          <section class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 mb-8">
            <h2 class="text-lg font-bold mb-4">Server Specifications</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">VM Size</p>
                <p class="font-mono text-sm font-bold">{vmSize}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">Region</p>
                <p class="font-mono text-sm font-bold">{(cluster.region || "eastus").toUpperCase()}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">SSD Storage</p>
                <p class="font-mono text-sm font-bold">{cluster.storage_gb || 50} GB Premium SSD</p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">Status</p>
                <p class="font-mono text-sm font-bold text-green-400">Active</p>
              </div>
            </div>
          </section>
        )}

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

        {/* Danger Zone */}
        <section class="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 mt-8">
          <h2 class="text-lg font-bold text-red-400 mb-2">Danger Zone</h2>
          <p class="text-sm text-tertiary mb-4">
            Deleting this cluster will permanently remove all stored memories, fact slots, and graph indexes. 
            If this is a dedicated VM, it will immediately stop the virtual machine and cancel any active subscription.
          </p>
          <Form action={deleteAction}>
            <input type="hidden" name="cluster_id" value={cluster.id} />
            <button
              type="submit"
              onClick$={(e) => {
                if (!confirm("Are you absolutely sure you want to delete this cluster? This action is irreversible.")) {
                  e.preventDefault();
                }
              }}
              class="rounded-lg bg-red-600 hover:bg-red-700 px-6 py-3 font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-950/20"
            >
              Delete Cluster
            </button>
          </Form>
        </section>
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Cluster Detail | ALETHEIADB",
  description: "Manage your AletheiaDB cluster.",
  pathname: "/platform/clusters/[id]",
  noindex: true
});
