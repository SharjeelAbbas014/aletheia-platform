import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";
import { buildSeoHead } from "~/lib/seo";

export default component$(() => {
  return (
    <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
      <main class="flex-1 overflow-y-auto p-8 lg:p-12 mb-20 max-w-5xl mx-auto w-full">
        <header class="mb-12 flex flex-col gap-4">
            <Link href="/platform" class="text-tertiary hover:text-primary flex items-center gap-1 transition-colors w-fit">
                <span class="material-symbols-outlined notranslate normal-case text-sm">arrow_back</span>
                Mission Control
            </Link>
            
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <h1 class="font-headline text-4xl font-extrabold tracking-tighter text-on-surface">prod-memory-cluster</h1>
                        <span class="rounded bg-green-500/10 px-2 py-0.5 font-mono text-xs text-green-400 font-bold uppercase tracking-widest">Active</span>
                        <span class="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary font-bold uppercase tracking-widest">Fractional</span>
                    </div>
                    <p class="text-tertiary font-mono text-sm">Cluster ID: cl_8f92j41nsa8</p>
                </div>

                {/* Migrate Button */}
                <button class="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-6 py-3 font-bold text-sm text-orange-400 transition-all hover:bg-orange-500 hover:text-white shadow-lg">
                    <span class="material-symbols-outlined notranslate normal-case text-sm">rocket_launch</span>
                    Migrate to Dedicated
                </button>
            </div>
        </header>

        <section class="mb-12">
            <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-8">
                <h2 class="text-xl font-bold mb-6">Connection Details</h2>
                
                <div class="space-y-6">
                    <div>
                        <p class="text-sm font-bold uppercase tracking-widest text-tertiary mb-2">Endpoint URL</p>
                        <div class="flex items-center gap-2 rounded-lg bg-black/40 p-4 font-mono text-sm text-primary border border-primary/20">
                            <span class="flex-1 truncate">https://api.aletheiadb.com/v1</span>
                            <button class="p-2 hover:bg-primary/20 rounded transition-colors text-primary">
                                <span class="material-symbols-outlined notranslate normal-case text-sm">content_copy</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <p class="text-sm font-bold uppercase tracking-widest text-tertiary mb-2">Cluster API Key</p>
                        <div class="flex items-center gap-2 rounded-lg bg-black/40 p-4 font-mono text-sm text-on-surface border border-outline-variant/20">
                            <span class="flex-1 truncate text-tertiary">••••••••••••••••••••••••••••••••</span>
                            <button class="p-2 hover:bg-surface-container-high rounded transition-colors">
                                <span class="material-symbols-outlined notranslate normal-case text-sm">key</span>
                            </button>
                        </div>
                        <p class="text-xs text-tertiary mt-2">Manage keys in Mission Control.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-8">
                <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">Compute Usage</p>
                <div class="flex items-end gap-3">
                    <h3 class="text-4xl font-black text-on-surface">14.2M</h3>
                    <p class="text-tertiary text-sm mb-1">vectors</p>
                </div>
                <div class="w-full bg-surface-container-highest rounded-full h-2 mt-4">
                    <div class="bg-primary h-2 rounded-full" style="width: 15%"></div>
                </div>
                <p class="text-xs text-tertiary mt-2">Fractional Tier pay-as-you-go.</p>
            </div>

            <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-8">
                <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">Storage Size</p>
                <div class="flex items-end gap-3">
                    <h3 class="text-4xl font-black text-on-surface">4.1</h3>
                    <p class="text-tertiary text-sm mb-1">GB</p>
                </div>
                <div class="w-full bg-surface-container-highest rounded-full h-2 mt-4">
                    <div class="bg-primary h-2 rounded-full" style="width: 8%"></div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Cluster Management | ALETHEIA",
  description: "Manage your Aletheia cluster.",
  pathname: "/platform/clusters/[id]",
  noindex: true
});
