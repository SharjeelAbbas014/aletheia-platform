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
  Loader2Icon
} from "lucide-qwik";
import {
  Form,
  Link,
  routeAction$,
  routeLoader$,
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

  const [keys, usage, clusters] = await Promise.all([
    getApiKeys(event),
    getUsageStats(event),
    getClusters(event)
  ]);

  return {
    user,
    keys,
    usage,
    clusters
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

export default component$(() => {
  const platformData = usePlatformData();
  const createKeyAction = useCreateApiKeyAction();
  const revokeKeyAction = useRevokeApiKeyAction();
  const keys = platformData.value.keys;
  const usage = platformData.value.usage;
  const clusters = platformData.value.clusters;

  const activeApiTab = useSignal<"keys" | "create">("keys");
  const newApiKeyName = useSignal("");

  useTask$(({ track }) => {
    const wasCreated = track(() => createKeyAction.value?.success);
    const createdToken = track(() => createKeyAction.value?.key?.token);

    if (wasCreated && createdToken) {
      newApiKeyName.value = "";
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
            <a class="flex items-center gap-3 rounded-md bg-primary/10 px-4 py-2 text-primary transition-all" href="#">
              <LayoutDashboardIcon class="w-4 h-4" />
              Mission Control
            </a>
            <a class="flex items-center gap-3 rounded-md px-4 py-2 text-tertiary transition-all hover:bg-surface-container-low hover:text-on-surface" href="#">
              <NetworkIcon class="w-4 h-4" />
              Knowledge Graph
            </a>
            <a class="flex items-center gap-3 rounded-md px-4 py-2 text-tertiary transition-all hover:bg-surface-container-low hover:text-on-surface" href="#">
              <BarChart3Icon class="w-4 h-4" />
              Metric Vault
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
          <div>
            <h1 class="font-headline text-4xl font-extrabold tracking-tighter text-on-surface">Mission Control</h1>
            <p class="mt-2 text-tertiary">Real-time oversight of your agent's cognitive substrate.</p>
          </div>
          <div class="flex items-center gap-4 rounded-xl bg-surface-container-low p-2">
            <div class="px-4 py-2 text-center">
              <p class="text-[10px] font-bold uppercase tracking-widest text-primary">Engine Status</p>
              <div class="flex items-center gap-2 mt-1 justify-center">
                <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <p class="font-mono text-xs text-on-surface">NOMINAL</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Bento Grid */}
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

        {/* API Keys and Quickstart */}
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div class="lg:col-span-2 space-y-8">
            {/* Clusters Section */}
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

            <section>
              <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h3 class="text-xl font-bold tracking-tight">API Key Management</h3>
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
              <p class="text-xs text-tertiary mb-4 leading-relaxed">Connect your local agent to the Aletheia engine using your provisioned key.</p>
              <pre class="overflow-x-auto rounded-xl bg-black/40 p-6 font-mono text-[10px] leading-relaxed text-primary/80 border border-primary/10">
                <code>{`from aletheia import AletheiaClient

client = AletheiaClient(
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
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Console | ALETHEIA",
  description: "Mission Control for your agentic memory engine.",
  pathname: "/platform",
  noindex: true
});
