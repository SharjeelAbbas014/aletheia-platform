import { component$ } from "@builder.io/qwik";
import {
  Form,
  Link,
  routeAction$,
  routeLoader$,
  type RequestHandler,
  type DocumentHead
} from "@builder.io/qwik-city";


import {
  DEFAULT_TEST_API_KEY,
  DEFAULT_TEST_API_KEY_ID,
  createApiKey,
  getApiKeys,
  revokeApiKey
} from "~/lib/api-keys";
import { requireAuth } from "~/lib/auth";
import { CONTACT_MAILTO } from "~/constants/contact";
import { setPrivateNoStore } from "~/lib/cache";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export const usePlatformData = routeLoader$((event) => {
  const user = requireAuth(event);
  const keys = getApiKeys(event.cookie);

  return {
    user,
    keys
  };
});

export const onRequest: RequestHandler = (event) => {
  setPrivateNoStore(event);
};

export const useCreateApiKeyAction = routeAction$(async (data, event) => {
  requireAuth(event);
  createApiKey(event.cookie, String(data.name ?? "Default production key"));

  return {
    created: true
  };
});

export const useRevokeApiKeyAction = routeAction$(async (data, event) => {
  requireAuth(event);
  const id = String(data.id ?? "");

  if (id) {
    revokeApiKey(event.cookie, id);
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
  const codeToken = keys[0]?.token ?? DEFAULT_TEST_API_KEY;

  return (
    <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
      {/* Side Navigation */}
      <aside class="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-outline-variant/15 bg-background font-body text-sm font-medium md:flex">
        <div class="p-6">
          <div class="mb-8 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded bg-primary-container shadow-lg">
              <span class="material-symbols-outlined text-on-primary-container text-lg">terminal</span>
            </div>
            <div>
              <h2 class="text-lg font-black leading-tight text-on-surface">Console</h2>
              <p class="text-[10px] uppercase tracking-widest text-tertiary">Developer Hub</p>
            </div>
          </div>
          <nav class="space-y-1">
            <a class="flex items-center gap-3 rounded-md bg-surface-container-high px-4 py-2 text-primary transition-all hover:translate-x-1" href="#">
              <span class="material-symbols-outlined text-sm">dashboard</span>
              Overview
            </a>
            <a class="flex items-center gap-3 rounded-md px-4 py-2 text-tertiary transition-all hover:translate-x-1 hover:bg-surface-container-low hover:text-on-surface" href="#">
              <span class="material-symbols-outlined text-sm">vpn_key</span>
              API Keys
            </a>
            <a class="flex items-center gap-3 rounded-md px-4 py-2 text-tertiary transition-all hover:translate-x-1 hover:bg-surface-container-low hover:text-on-surface" href="#">
              <span class="material-symbols-outlined text-sm">bar_chart</span>
              Usage
            </a>
          </nav>
        </div>
        <div class="mt-auto border-t border-outline-variant/10 p-4">
          <div class="rounded-lg border border-outline-variant/15 bg-surface-container-low p-4">
            <p class="mb-3 text-xs text-on-surface-variant">Upgrade to Enterprise for human-grade cognition at scale.</p>
            <button class="w-full rounded bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-lg transition-transform active:scale-95">
              Upgrade Plan
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main class="ml-0 flex-1 overflow-y-auto p-8 md:ml-64 lg:p-12">
        <header class="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 class="font-headline text-4xl font-extrabold tracking-tighter text-on-surface">Mission Control</h1>
            <p class="mt-2 text-tertiary">Welcome back, {platformData.value.user.email}. Monitor your memory strings here.</p>
          </div>
          <div class="flex items-center gap-4 rounded-xl bg-surface-container-low p-2">
            <div class="px-4 py-2">
              <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary">Environment</p>
              <p class="font-mono text-sm text-secondary">production-01</p>
            </div>
            <div class="h-8 w-[1px] bg-outline-variant/20"></div>
            <div class="px-4 py-2">
              <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary">Region</p>
              <p class="font-mono text-sm text-on-surface">us-east-1</p>
            </div>
          </div>
        </header>

        {/* Stats Bento Grid */}
        <section class="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div class="group relative overflow-hidden rounded-2xl bg-surface-container-low p-8 transition-colors hover:bg-surface-container-high">
            <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10"></div>
            <p class="text-sm font-medium text-tertiary">Active API Keys</p>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-5xl font-black tracking-tighter text-on-surface">{keys.length}</span>
              <span class="font-mono text-sm text-secondary">+1</span>
            </div>
          </div>
          
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-8 transition-colors hover:bg-surface-container-high">
            <div class="mb-4 flex items-center justify-between">
              <span class="material-symbols-outlined text-secondary">bolt</span>
              <span class="rounded-full bg-secondary/10 px-2 py-1 font-mono text-xs text-secondary">Optimal</span>
            </div>
            <p class="text-sm font-medium text-tertiary">Avg Latency</p>
            <p class="mt-1 text-3xl font-bold tracking-tight text-on-surface">124<span class="ml-1 text-lg font-normal text-tertiary">ms</span></p>
          </div>

          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-8 transition-colors hover:bg-surface-container-high">
            <p class="mb-1 text-sm font-medium text-tertiary">Memory Usage</p>
            <p class="text-3xl font-bold tracking-tight text-on-surface">42.8<span class="ml-1 text-lg font-normal text-tertiary">GB</span></p>
            <div class="mt-4 space-y-2">
              <div class="flex justify-between text-xs text-tertiary">
                <span>Vector Cache</span>
                <span class="font-mono text-on-surface">8.6 GB</span>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div class="h-full w-[20%] bg-primary"></div>
              </div>
            </div>
          </div>
        </section>

        {/* API Keys and Quickstart */}
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div class="lg:col-span-2 space-y-8">
            <section>
              <div class="mb-6 flex items-center justify-between">
                <h3 class="text-xl font-bold tracking-tight">API Management</h3>
                <Link href="#" class="text-sm font-bold text-primary hover:underline">Provision New Key</Link>
              </div>

              {revokeKeyAction.value?.revoked ? (
                <div class="mb-4 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">API key revoked successfully.</div>
              ) : null}

              <div class="space-y-4">
                {keys.map((key) => (
                  <div key={key.id} class="group flex flex-col justify-between gap-6 rounded-xl border border-outline-variant/10 bg-surface-container-low p-6 transition-all hover:border-outline-variant/30 hover:bg-surface-container-high lg:flex-row lg:items-center">
                    <div class="flex items-center gap-4">
                      <div class="rounded-lg bg-surface-container-highest p-3 text-secondary">
                        <span class="material-symbols-outlined">key</span>
                      </div>
                      <div>
                        <h4 class="font-bold text-on-surface">{key.name}</h4>
                        <p class="mt-1 font-mono text-xs text-outline tracking-wider">{key.token.slice(0, 12)}••••••••</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-8">
                      <div>
                        <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary">Created</p>
                        <p class="font-mono text-sm text-on-surface">{formatDate(key.createdAt)}</p>
                      </div>
                      {key.id !== DEFAULT_TEST_API_KEY_ID && (
                        <Form action={revokeKeyAction}>
                          <input type="hidden" name="id" value={key.id} />
                          <button type="submit" class="text-tertiary transition-colors hover:text-red-400">
                            <span class="material-symbols-outlined">delete</span>
                          </button>
                        </Form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div class="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-8">
                <h3 class="text-lg font-bold mb-4">Create New Key</h3>
                <Form action={createKeyAction} class="flex flex-col gap-4 sm:flex-row">
                  <input
                    name="name"
                    class="flex-1 rounded-lg border border-outline-variant/20 bg-background px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                    placeholder="Key label (e.g. Production Alpha)"
                    value={String(createKeyAction.formData?.get("name") ?? "")}
                  />
                  <button type="submit" class="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-transform active:scale-95">
                    Generate Key
                  </button>
                </Form>
                {createKeyAction.value?.created && (
                  <p class="mt-4 text-xs text-secondary">A new key has been generated and added to your clusters.</p>
                )}
              </div>
            </section>
          </div>

          <aside class="space-y-8">
            <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-8">
               <div class="mb-4 flex items-center justify-between">
                <h3 class="text-lg font-bold">Quickstart</h3>
                <span class="rounded bg-surface-container-highest px-2 py-1 font-mono text-[10px] text-tertiary">Python SDK</span>
              </div>
              <pre class="overflow-x-auto rounded-xl bg-background p-6 font-mono text-xs leading-relaxed text-secondary border border-outline-variant/10">
                <code>{`from aletheia import Client
                
client = Client(
  api_key="${codeToken}"
)

# Search memories
results = client.recall(
  "user preferences",
  id="u_99"
)`}</code>
              </pre>
            </div>

            <div class="rounded-2xl bg-primary-container p-8 text-on-primary-container">
              <h3 class="font-black text-xl mb-2">Need a dedicated host?</h3>
              <p class="text-sm opacity-80 leading-relaxed">Scale your agent memory layer with private VPC clusters and sub-millisecond sync.</p>
              <a
                href={CONTACT_MAILTO}
                class="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-on-primary-container py-3 text-sm font-bold text-primary-container shadow-xl transition-transform active:scale-95"
              >
                Contact Sales
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Console | ALETHEIA",
  meta: [
    {
      name: "description",
      content: "Developer console for the Aletheia engine."
    }
  ]
};
