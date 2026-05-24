import { component$, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import {
  LayoutDashboardIcon,
  NetworkIcon,
  BarChart3Icon,
  LogOutIcon,
  PlusIcon,
  ServerIcon,
  CopyIcon,
  CheckCircle2Icon,
  Trash2Icon,
  KeyIcon,
  Loader2Icon,
  CreditCardIcon,
  SettingsIcon,
  CheckIcon,
  ExternalLinkIcon
} from "lucide-qwik";
import {
  Form,
  Link,
  routeAction$,
  routeLoader$,
  useLocation,
  type RequestHandler,
  type DocumentHead
} from "@builder.io/qwik-city";

import {
  createApiKey,
  getApiKeys,
  revokeApiKey,
  getUsageStats,
  type ApiKey
} from "~/lib/api-keys";
import { getClusters, type Cluster } from "~/lib/clusters";
import { requireAuth } from "~/lib/auth";
import { CONTACT_MAILTO } from "~/constants/contact";
import { setPrivateNoStore } from "~/lib/cache";
import { buildSeoHead } from "~/lib/seo";
import { getAdminSupabaseClient } from "~/lib/supabase";

function formatDate(value: number, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

const LocalDateTime = component$((props: { value: number | null }) => {
  const label = useSignal(
    props.value ? formatDate(props.value, "en-US") : "Never"
  );

  useVisibleTask$(({ track }) => {
    track(() => props.value);
    if (!props.value) {
      label.value = "Never";
      return;
    }

    label.value = formatDate(props.value);
  });

  return <>{label.value}</>;
});

export const usePlatformData = routeLoader$(async (event) => {
  const user = requireAuth(event);
  const supabase = getAdminSupabaseClient(event.env);
  if (!supabase) throw event.error(500, "Database connection offline");

  const [keys, usage, clusters, sub, purchases] = await Promise.all([
    getApiKeys(event),
    getUsageStats(event),
    getClusters(event),
    supabase.from("subscriptions").select("*").eq("user_id", user.user_id).maybeSingle().then(res => res.data),
    supabase.from("purchases").select("*").eq("user_id", user.user_id).order("created_at", { ascending: false }).then(res => res.data || [])
  ]);

  return {
    user,
    keys,
    usage,
    clusters,
    sub,
    purchases
  };
});

export const onRequest: RequestHandler = (event) => {
  setPrivateNoStore(event);
};

export const useCreateApiKeyAction = routeAction$(async (data, event) => {
  requireAuth(event);
  const name = String(data.name ?? "New API Key");

  const newKey = await createApiKey(event, name);

  return {
    success: !!newKey,
    key: newKey
  };
});

export const useRevokeApiKeyAction = routeAction$(async (data, event) => {
  requireAuth(event);
  const id = String(data.id ?? "");

  if (id) {
    await revokeApiKey(event, id);
  }

  return {
    revoked: true
  };
});

const plans = [
  {
    id: "fractional",
    name: "Fractional",
    price: "$1.00",
    unit: "/1M truths",
    description: "Pay-as-you-go on the AletheiaDB shared engine",
    features: ["Hosted on engine.aletheiadb.com", "Shared database substrate", "10K free operations/mo", "Access via global API"],
    cta: "Current Plan",
    highlighted: false,
  },
  {
    id: "azure_micro",
    name: "Developer Micro",
    price: "$12.00",
    unit: "/month",
    description: "Azure Standard_B1s dedicated VM",
    features: ["1 vCPU | 1 GiB RAM", "Isolated SQLite substrate", "Best for sandboxing & dev", "Aletheia cut included"],
    cta: "Deploy VM",
    highlighted: false,
  },
  {
    id: "azure_standard",
    name: "Agent Standard",
    price: "$40.00",
    unit: "/month",
    description: "Azure Standard_B2s dedicated VM",
    features: ["2 vCPUs | 4 GiB RAM", "Multi-agent core substrate", "Isolated SQLite index", "Fast vector search"],
    cta: "Deploy VM",
    highlighted: false,
  },
  {
    id: "azure_pro",
    name: "Production Core",
    price: "$90.00",
    unit: "/month",
    description: "Azure Standard_D2as_v5 dedicated VM",
    features: ["2 vCPUs | 8 GiB RAM", "50 GB Premium SSD", "Dedicated production load", "Zero noisy neighbors"],
    cta: "Deploy VM",
    highlighted: true,
  },
  {
    id: "azure_scale",
    name: "Scale Master",
    price: "$175.00",
    unit: "/month",
    description: "Azure Standard_D4as_v5 dedicated VM",
    features: ["4 vCPUs | 16 GiB RAM", "100 GB Premium SSD", "Massive graph crawls", "Local re-ranking models"],
    cta: "Deploy VM",
    highlighted: false,
  },
  {
    id: "dedicated_l4",
    name: "Dedicated Pro",
    price: "$400.00",
    unit: "/month",
    description: "Azure Standard_NV4as_v4 dedicated VM",
    features: ["4 vCPUs | 14 GiB RAM", "1/8 AMD Radeon Pro V320 GPU", "Hardware accelerated hosting", "Dedicated memory engine"],
    cta: "Deploy VM",
    highlighted: false,
  },
  {
    id: "azure_gpu",
    name: "GPU Superbrain",
    price: "$450.00",
    unit: "/month",
    description: "Azure Standard_NC4as_T4 GPU VM",
    features: ["4 vCPUs | 28 GiB RAM", "1 NVIDIA T4 GPU", "Ultra-low latency embeddings", "Local re-ranking inference"],
    cta: "Deploy VM",
    highlighted: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    unit: "",
    description: "Custom deployment, on-premise option",
    features: ["Unlimited requests", "Unlimited storage", "Dedicated infrastructure", "Custom SLA", "24/7 priority support"],
    cta: "Contact Sales",
    highlighted: false,
    contact: true,
  },
];

export default component$(() => {
  const platformData = usePlatformData();
  const createKeyAction = useCreateApiKeyAction();
  const revokeKeyAction = useRevokeApiKeyAction();
  const keys = platformData.value.keys;
  const usage = platformData.value.usage;
  const clusters = platformData.value.clusters;

  const loc = useLocation();
  const initialTab = (loc.url.searchParams.get("tab") as any) || "overview";
  const activeMissionTab = useSignal<"overview" | "api" | "billing">(initialTab);
  const activeApiTab = useSignal<"keys" | "create">("keys");
  const newApiKeyName = useSignal("");

  useTask$(({ track }) => {
    const wasCreated = track(() => createKeyAction.value?.success);
    const createdToken = track(() => createKeyAction.value?.key?.token);

    if (wasCreated && createdToken) {
      newApiKeyName.value = "";
      activeMissionTab.value = "api";
      activeApiTab.value = "keys";
    }
  });

  // Use the newly created key if available
  const activeKey = createKeyAction.value?.key?.token || keys[0]?.token || "YOUR_API_KEY";
  // Proxy base_url: users always hit the Qwik frontend which securely forwards to the Rust engine
  const proxyBaseUrl = typeof window !== "undefined" ? window.location.origin + "/api" : "https://aletheiadb.com/api";

  return (
    <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
      {/* Side Navigation */}
      <aside class="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-outline-variant/15 bg-surface-container-lowest font-body text-sm font-medium md:flex pt-[104px]">
        <div class="p-6">


          <nav class="space-y-1">
            <button
              type="button"
              class={`flex w-full items-center gap-3 rounded-md px-4 py-2 text-left transition-all ${
                activeMissionTab.value === "overview" || activeMissionTab.value === "api"
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-tertiary hover:bg-surface-container-low hover:text-on-surface"
              }`}
              onClick$={() => { activeMissionTab.value = "overview"; }}
            >
              <LayoutDashboardIcon class="w-4 h-4" />
              Mission Control
            </button>
            <button
              type="button"
              class={`flex w-full items-center gap-3 rounded-md px-4 py-2 text-left transition-all ${
                activeMissionTab.value === "billing"
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-tertiary hover:bg-surface-container-low hover:text-on-surface"
              }`}
              onClick$={() => { activeMissionTab.value = "billing"; }}
            >
              <CreditCardIcon class="w-4 h-4" />
              Billing
            </button>
            <a class="flex items-center gap-3 rounded-md px-4 py-2 text-tertiary transition-all hover:bg-surface-container-low hover:text-on-surface" href="/platform/settings">
              <SettingsIcon class="w-4 h-4" />
              Settings
            </a>
          </nav>
        </div>

        <div class="mt-auto p-6 border-t border-outline-variant/10 mb-[104px]">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-on-secondary uppercase">
              {platformData.value.user.username.slice(0, 2)}
            </div>
            <div class="flex-1 overflow-hidden">
              <p class="truncate text-xs font-bold">{platformData.value.user.username}</p>
              <p class="text-[10px] text-tertiary">Free Tier</p>
            </div>
            <form action="/logout" method="post">
              <button type="submit" class="text-tertiary hover:text-on-surface mt-1">
                <LogOutIcon class="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main class="ml-0 flex-1 overflow-y-auto p-8 md:ml-64 lg:p-12">
        <header class="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          {activeMissionTab.value === "billing" ? (
            <div>
              <h1 class="font-headline text-4xl font-extrabold tracking-tighter text-on-surface">Billing & Prepaid Usage</h1>
              <p class="mt-2 text-tertiary">Manage your cognitive memory credits and hosting plans.</p>
            </div>
          ) : (
            <div>
              <h1 class="font-headline text-4xl font-extrabold tracking-tighter text-on-surface">Mission Control</h1>
              <p class="mt-2 text-tertiary">Real-time oversight of your agent's cognitive substrate.</p>
            </div>
          )}
          {activeMissionTab.value !== "billing" && (
            <div class="flex items-center gap-4 rounded-xl bg-surface-container-low p-2">
              <div class="px-4 py-2 text-center">
                <p class="text-[10px] font-bold uppercase tracking-widest text-primary">Engine Status</p>
                <div class="flex items-center gap-2 mt-1 justify-center">
                  <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p class="font-mono text-xs text-on-surface">NOMINAL</p>
                </div>
              </div>
            </div>
          )}
        </header>

        {activeMissionTab.value !== "billing" && (
          <div class="mb-10 inline-flex rounded-2xl border border-outline-variant/15 bg-surface-container-low p-1">
          <button
            type="button"
            class={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] transition-colors ${
              activeMissionTab.value === "overview"
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                : "text-tertiary hover:text-on-surface"
            }`}
            onClick$={() => {
              activeMissionTab.value = "overview";
            }}
          >
            <LayoutDashboardIcon class="h-4 w-4" />
            Overview
          </button>
          <button
            type="button"
            class={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] transition-colors ${
              activeMissionTab.value === "api"
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                : "text-tertiary hover:text-on-surface"
            }`}
            onClick$={() => {
              activeMissionTab.value = "api";
            }}
          >
            <KeyIcon class="h-4 w-4" />
            API Access
          </button>
        </div>
        )}

        {activeMissionTab.value === "overview" && (
          <>
            <section class="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 transition-colors hover:bg-surface-container-high">
                <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary">Total Requests</p>
                <p class="mt-2 text-3xl font-black text-on-surface">{usage?.request_count || 0}</p>
              </div>

              <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 transition-colors hover:bg-surface-container-high">
                <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary">Memories Ingested</p>
                <p class="mt-2 text-3xl font-black text-on-surface">{usage?.ingest_count || 0}</p>
              </div>

              <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 transition-colors hover:bg-surface-container-high">
                <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary">Semantic Queries</p>
                <p class="mt-2 text-3xl font-black text-on-surface">{usage?.query_count || 0}</p>
              </div>

              <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 transition-colors hover:bg-surface-container-high">
                <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary">Last Activity</p>
                <p class="mt-2 text-lg font-bold text-on-surface">
                  <LocalDateTime value={usage?.last_request_ms ?? null} />
                </p>
              </div>
            </section>

            <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div class="lg:col-span-2 space-y-8">
                <section class="mb-12">
                  <div class="mb-6 flex items-center justify-between">
                    <h3 class="text-xl font-bold tracking-tight">Your Clusters</h3>
                    <Link href="/platform/clusters/new" class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-sm text-on-primary transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20">
                      <PlusIcon class="w-4 h-4" />
                      Deploy Cluster
                    </Link>
                  </div>

                  <div class="space-y-4">
                    {clusters.length === 0 && (
                      <div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/20 p-12 text-center">
                        <ServerIcon class="w-10 h-10 text-outline-variant mb-4" />
                        <p class="text-tertiary mb-4">No clusters yet. Deploy one to start connecting your agents.</p>
                        <Link href="/platform/clusters/new" class="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-on-primary transition-all hover:scale-[1.02]">
                          Deploy First Cluster
                        </Link>
                      </div>
                    )}
                    {clusters.map((cluster: Cluster) => (
                      <div key={cluster.id} class="group flex flex-col justify-between gap-6 rounded-xl border border-outline-variant/10 bg-surface-container-low p-6 transition-all hover:border-primary/20 lg:flex-row lg:items-center">
                        <div class="flex items-center gap-4">
                          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
                            <ServerIcon class="w-6 h-6" />
                          </div>
                          <div>
                            <div class="flex items-center gap-3">
                              <h4 class="font-bold text-on-surface text-lg">{cluster.name}</h4>
                              <span class={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${cluster.status === "active" ? "bg-green-500/10 text-green-400" :
                                cluster.status === "provisioning" ? "bg-yellow-500/10 text-yellow-400" :
                                  "bg-red-500/10 text-red-400"
                                }`}>{cluster.status}</span>
                              <span class="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary font-bold uppercase tracking-widest">{cluster.tier}</span>
                            </div>
                            <p class="mt-1 font-mono text-xs text-tertiary">{cluster.endpoint_url}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-4">
                          <Link href={`/platform/clusters/${cluster.id}`} class="rounded-lg border border-outline-variant/20 px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high hover:border-primary/50">
                            Manage
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <aside class="space-y-8">
                <div class="rounded-2xl bg-surface-container-high p-8 border border-primary/20">
                  <h3 class="font-black text-xl mb-2 text-primary">Need Scale?</h3>
                  <p class="text-sm text-tertiary leading-relaxed">Unlock dedicated HNSW clusters and multi-region synchronization for massive agent deployments.</p>
                  <a
                    href={CONTACT_MAILTO}
                    class="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-bold text-on-primary shadow-xl transition-all hover:scale-[1.02] active:scale-[0.95]"
                  >
                    Contact Engineering
                  </a>
                </div>
              </aside>
            </div>
          </>
        )}

        {activeMissionTab.value === "api" && (
          <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div class="lg:col-span-2 space-y-8">
              <section>
                <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 class="text-xl font-bold tracking-tight">API Key Management</h3>
                    <p class="mt-2 text-sm text-tertiary">Generate, rotate, and segment access keys for every environment connected to your memory engine.</p>
                  </div>
                  <div class="inline-flex rounded-xl border border-outline-variant/15 bg-surface-container-low p-1">
                    <button
                      type="button"
                      class={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                        activeApiTab.value === "keys"
                          ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                          : "text-tertiary hover:text-on-surface"
                      }`}
                      onClick$={() => {
                        activeApiTab.value = "keys";
                      }}
                    >
                      Active Keys
                    </button>
                    <button
                      type="button"
                      class={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                        activeApiTab.value === "create"
                          ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                          : "text-tertiary hover:text-on-surface"
                      }`}
                      onClick$={() => {
                        activeApiTab.value = "create";
                      }}
                    >
                      Create Key
                    </button>
                  </div>
                </div>

                {createKeyAction.value?.success && createKeyAction.value.key?.token && (
                  <div class="mb-8 rounded-2xl bg-primary/10 border border-primary/30 p-6 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                    <div class="flex items-center gap-3 mb-4 text-primary">
                      <CheckCircle2Icon class="w-5 h-5" />
                      <p class="font-bold">New Key Generated Successfully</p>
                    </div>
                    <p class="text-sm text-tertiary mb-4">Make sure to copy your API key now. You won't be able to see it again.</p>
                    <div class="flex items-center gap-2 rounded-lg bg-black/40 p-4 font-mono text-sm text-primary border border-primary/20">
                      <span class="flex-1 truncate">{createKeyAction.value.key.token}</span>
                      <button
                        class="p-2 hover:bg-primary/20 rounded transition-colors"
                        onClick$={() => navigator.clipboard.writeText(createKeyAction.value?.key?.token || "")}
                      >
                        <CopyIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {activeApiTab.value === "keys" ? (
                  <div class="space-y-4">
                    {keys.length === 0 && !createKeyAction.value?.success && (
                      <div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/20 p-12 text-center">
                        <KeyIcon class="w-10 h-10 text-outline-variant mb-4" />
                        <p class="text-tertiary mb-4">No API keys yet. Create one to start using the engine.</p>
                        <button
                          type="button"
                          class="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-on-primary transition-all hover:scale-[1.02]"
                          onClick$={() => {
                            activeApiTab.value = "create";
                          }}
                        >
                          Create First Key
                        </button>
                      </div>
                    )}

                    {keys.map((key) => (
                      <div key={key.key_id} class="group flex flex-col justify-between gap-6 rounded-xl border border-outline-variant/10 bg-surface-container-low p-6 transition-all hover:border-primary/20 lg:flex-row lg:items-center">
                        <div class="flex items-center gap-4">
                          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
                            <KeyIcon class="w-5 h-5" />
                          </div>
                          <div>
                            <h4 class="font-bold text-on-surface">{key.name}</h4>
                            <p class="mt-1 font-mono text-xs text-tertiary tracking-widest">{key.key_prefix}••••••••••••</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-8">
                          <div class="text-right">
                            <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary">Created</p>
                            <p class="font-mono text-[10px] text-on-surface">
                              <LocalDateTime value={key.created_at_ms} />
                            </p>
                          </div>
                          <Form action={revokeKeyAction}>
                            <input type="hidden" name="id" value={key.key_id} />
                            <button type="submit" class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500 hover:text-white">
                              <Trash2Icon class="w-4 h-4" />
                            </button>
                          </Form>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <section>
                    <div class="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-8">
                      <h3 class="text-lg font-bold mb-4">Provision Access</h3>
                      <p class="text-sm text-tertiary mb-6">Create multiple keys to isolate your staging, production, and sidecar environments.</p>
                      <Form action={createKeyAction} class="flex flex-col gap-4 sm:flex-row">
                        <input
                          name="name"
                          value={newApiKeyName.value}
                          onInput$={(_, el) => {
                            newApiKeyName.value = el.value;
                          }}
                          class="flex-1 rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-3 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                          placeholder="Key identifier (e.g. Production Cluster 01)"
                          required
                        />
                        <button
                          type="submit"
                          disabled={createKeyAction.isRunning}
                          class="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-bold text-sm text-on-primary transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                        >
                          {createKeyAction.isRunning ? (
                            <>
                              <Loader2Icon class="w-4 h-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            "Generate New Key"
                          )}
                        </button>
                      </Form>
                    </div>
                  </section>
                )}
              </section>
            </div>

            <aside class="space-y-8">
              <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-8">
                <div class="mb-4 flex items-center justify-between">
                  <h3 class="text-lg font-bold">Local Sidecar</h3>
                  <span class="rounded bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary font-bold">Python SDK</span>
                </div>
                <p class="text-xs text-tertiary mb-4 leading-relaxed">Connect your local agent to the AletheiaDB engine using your provisioned key.</p>
                <pre class="overflow-x-auto rounded-xl bg-black/40 p-6 font-mono text-[10px] leading-relaxed text-primary/80 border border-primary/10">
                  <code>{`from aletheia import AletheiaDBClient

client = AletheiaDBClient(
  api_key="${activeKey}",
  base_url="${proxyBaseUrl}"
)

# Ingest episodic memory
client.ingest(
  entity_id="u_99",
  text="I prefer jasmine tea."
)`}</code>
                </pre>
              </div>

              <div class="rounded-2xl bg-surface-container-high p-8 border border-primary/20">
                <h3 class="font-black text-xl mb-2 text-primary">Need Scale?</h3>
                <p class="text-sm text-tertiary leading-relaxed">Unlock dedicated HNSW clusters and multi-region synchronization for massive agent deployments.</p>
                <a
                  href={CONTACT_MAILTO}
                  class="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-bold text-on-primary shadow-xl transition-all hover:scale-[1.02] active:scale-[0.95]"
                >
                  Contact Engineering
                </a>
              </div>
            </aside>
          </div>
        )}

        {activeMissionTab.value === "billing" && (
          <div class="space-y-12">
            {/* Prepaid Token Balance & Monthly Free Allocation */}
            <section class="grid gap-6 md:grid-cols-2 animate-fade-in">
              {/* Token Credits Status */}
              <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 flex flex-col justify-between">
                <div>
                  <p class="text-xs font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-1">
                    <CheckIcon class="w-4 h-4 text-primary" /> Active Credits
                  </p>
                  <h2 class="text-3xl font-extrabold text-on-surface">
                    {platformData.value.sub?.token_balance !== undefined ? platformData.value.sub.token_balance.toLocaleString() : "10,000"}
                    <span class="text-sm font-medium text-tertiary ml-2">truths remaining</span>
                  </h2>
                  
                  {/* Monthly Free Tier Progress */}
                  {platformData.value.sub?.token_balance !== undefined && platformData.value.sub.token_balance <= 10000 ? (
                    <div class="mt-6">
                      <div class="flex justify-between text-xs font-bold text-tertiary mb-1">
                        <span>Monthly Free Allocation</span>
                        <span>{platformData.value.sub.token_balance.toLocaleString()} / 10,000 left</span>
                      </div>
                      <div class="w-full bg-outline-variant/20 rounded-full h-2 overflow-hidden">
                        <div 
                          class="bg-primary h-full transition-all duration-500" 
                          style={{ width: `${(platformData.value.sub.token_balance / 10000) * 100}%` }}
                        ></div>
                      </div>
                      <p class="text-[10px] text-tertiary mt-2">Resets automatically every 30 days. Ingestions and queries deduct 1 credit each.</p>
                    </div>
                  ) : (
                    <p class="text-xs text-green-400 font-medium mt-4">
                      Free tier fully utilized. Active prepaid growth credits: {(((platformData.value.sub?.token_balance || 10000) - 10000)).toLocaleString()} truths.
                    </p>
                  )}
                </div>
              </div>

              {/* Refill Tokens Selector */}
              <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
                <p class="text-xs font-bold uppercase tracking-widest text-tertiary mb-4">Refill Prepaid Tokens</p>
                <div class="space-y-3">
                  {[
                    { id: "starter", name: "Starter Refill ($5.00)", desc: "3.1M truths (~$1.60/M)", tokens: 3125000 },
                    { id: "growth", name: "Growth Refill ($10.00)", desc: "6.6M truths (~$1.50/M)", tokens: 6666666 },
                    { id: "scale", name: "Scale Refill ($20.00)", desc: "15.0M truths (~$1.33/M)", tokens: 15000000 },
                  ].map((pack) => (
                    <form key={pack.id} method="post" action="/api/billing/buy-tokens" class="flex items-center justify-between p-3 rounded-xl border border-outline-variant/5 bg-black/20 hover:border-primary/30 transition-all">
                      <input type="hidden" name="package_id" value={pack.id} />
                      <div>
                        <p class="text-sm font-bold">{pack.name}</p>
                        <p class="text-[10px] text-tertiary">{pack.desc}</p>
                      </div>
                      <button type="submit" class="rounded-lg bg-primary px-4 py-2 font-bold text-xs text-on-primary hover:opacity-90 transition-opacity">
                        Buy
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            </section>

            {/* Current Plan Info */}
            {platformData.value.sub && (
              <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-bold uppercase tracking-widest text-tertiary mb-1">Current Plan</p>
                    <p class="text-2xl font-bold capitalize">{platformData.value.sub.tier?.replace("_", " ") || "Fractional"}</p>
                    <p class="text-sm text-tertiary mt-1">
                      Status: <span class="capitalize text-green-400 font-medium">{platformData.value.sub.status}</span>
                    </p>
                  </div>
                  {platformData.value.sub.stripe_customer_id && (
                    <form method="post" action="/api/billing/portal">
                      <button
                        type="submit"
                        class="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-6 py-3 font-bold text-sm text-primary transition-all hover:bg-primary hover:text-white"
                      >
                        <CreditCardIcon class="w-4 h-4" />
                        Manage in Stripe
                        <ExternalLinkIcon class="w-3 h-3" />
                      </button>
                    </form>
                  )}
                </div>
                {platformData.value.sub.current_period_end && (
                  <p class="text-xs text-tertiary mt-3">
                    Current period ends: {new Date(platformData.value.sub.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Plan Cards */}
            <div>
              <h2 class="text-xl font-bold text-on-surface mb-6">Hosting Plans</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const isCurrent = platformData.value.sub?.tier === plan.id;
                  return (
                    <div
                      key={plan.id}
                      class={`rounded-2xl border p-6 flex flex-col ${
                        plan.highlighted ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "border-outline-variant/10 bg-surface-container-low"
                      } ${isCurrent ? "ring-2 ring-primary" : ""}`}
                    >
                      {plan.highlighted && !isCurrent && (
                        <span class="text-xs font-bold uppercase tracking-widest text-primary mb-2">Popular</span>
                      )}
                      <h3 class="text-xl font-bold">{plan.name}</h3>
                      <p class="text-3xl font-extrabold mt-2">
                        {plan.price}<span class="text-sm font-normal text-tertiary">{plan.unit}</span>
                      </p>
                      <p class="text-sm text-tertiary mt-2 mb-4">{plan.description}</p>
                      <ul class="space-y-2 flex-1 mb-6">
                        {plan.features.map((f) => (
                          <li key={f} class="flex items-start gap-2 text-sm">
                            <CheckIcon class="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {isCurrent ? (
                        <button disabled class="w-full py-3 px-4 rounded-xl border border-outline-variant/20 text-sm font-bold text-tertiary cursor-default">
                          Current Plan
                        </button>
                      ) : plan.contact ? (
                        <a href="mailto:sales@aletheiadb.com" class="block w-full text-center py-3 px-4 rounded-xl border border-outline-variant/20 text-sm font-bold hover:bg-surface-container-high transition-colors">
                          Contact Sales
                        </a>
                      ) : (
                        <Link href={`/platform/clusters/new?tier=${plan.id}`} class="block w-full text-center py-3 px-4 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity">
                          {plan.cta}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Purchase History */}
            <section class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 shadow-lg">
              <h2 class="text-xl font-bold text-on-surface mb-2">Purchase History</h2>
              <p class="text-xs text-tertiary mb-6">A record of your past prepaid credit refills, dedicated VMs, and hosting plan upgrades.</p>
              
              <div class="overflow-x-auto">
                <table class="w-full border-collapse text-left text-sm text-on-surface">
                  <thead>
                    <tr class="border-b border-outline-variant/10 text-xs font-bold uppercase tracking-widest text-tertiary">
                      <th class="py-3 px-4">Date</th>
                      <th class="py-3 px-4">Description</th>
                      <th class="py-3 px-4 text-right">Amount</th>
                      <th class="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-outline-variant/5">
                    {platformData.value.purchases?.length === 0 ? (
                      <tr>
                        <td colSpan={4} class="py-8 text-center text-tertiary">
                          No purchases found. Use a credit refill package or deploy a dedicated VM.
                        </td>
                      </tr>
                    ) : (
                      platformData.value.purchases?.map((p: any) => (
                        <tr key={p.id} class="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td class="py-4 px-4 font-mono text-xs text-tertiary">
                            {new Date(p.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td class="py-4 px-4 font-semibold text-on-surface">
                            {p.description}
                          </td>
                          <td class="py-4 px-4 text-right font-mono font-bold text-on-surface">
                            ${Number(p.amount).toFixed(2)}
                          </td>
                          <td class="py-4 px-4 text-center">
                            <span class="inline-flex rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-400">
                              Paid
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Console | ALETHEIADB",
  description: "Mission Control for your agentic memory engine.",
  pathname: "/platform",
  noindex: true
});
