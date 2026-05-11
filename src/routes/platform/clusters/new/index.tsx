import { component$, useSignal } from "@builder.io/qwik";
import { Form, Link, type DocumentHead } from "@builder.io/qwik-city";
import { buildSeoHead } from "~/lib/seo";
import { setPrivateNoStore } from "~/lib/cache";
import type { RequestHandler } from "@builder.io/qwik-city";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  RocketIcon,
  LockIcon,
  ZapIcon
} from "lucide-qwik";
import { requireAuth } from "~/lib/auth";

export const onRequest: RequestHandler = (event) => {
  setPrivateNoStore(event);
  requireAuth(event);
};

export default component$(() => {
  const selectedTier = useSignal<string>('fractional');
  const clusterName = useSignal<string>('');

  return (
    <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
      <main class="flex-1 overflow-y-auto p-8 lg:p-12 mb-20 max-w-5xl mx-auto w-full pt-[104px]">
        <header class="mb-12 flex flex-col gap-2">
          <Link href="/platform" class="text-tertiary hover:text-primary mb-4 flex items-center gap-1 transition-colors w-fit">
            <ArrowLeftIcon class="w-4 h-4" />
            Back to Mission Control
          </Link>
          <h1 class="font-headline text-4xl font-extrabold tracking-tighter text-on-surface">Deploy New Cluster</h1>
          <p class="mt-2 text-tertiary">Select a tier and provision your cognitive subset.</p>
        </header>

        <Form action="/api/billing/checkout" method="post">
          {/* Hidden fields */}
          <input type="hidden" name="tier" value={selectedTier.value} />

          <section class="mb-12">
            <h2 class="text-xl font-bold mb-4">1. Cluster Name</h2>
            <input
              type="text"
              name="name"
              bind:value={clusterName}
              class="w-full rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors max-w-md"
              placeholder="e.g. prod-memory-cluster"
              required
            />
          </section>

          <section class="mb-12">
            <h2 class="text-xl font-bold mb-4">2. Select Compute Tier</h2>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Fractional Tier */}
              <div
                class={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${selectedTier.value === 'fractional' ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface-container-low hover:border-primary/50'}`}
                onClick$={() => selectedTier.value = 'fractional'}
              >
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="font-bold text-xl text-on-surface">Fractional</h3>
                    <p class="text-sm text-tertiary">Shared Infrastructure</p>
                  </div>
                  <span class="rounded bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary font-bold uppercase tracking-widest">Free</span>
                </div>
                <ul class="text-sm text-tertiary space-y-2 mb-6">
                  <li class="flex items-center gap-2"><CheckCircle2Icon class="w-4 h-4 text-primary" /> Spins up instantly</li>
                  <li class="flex items-center gap-2"><CheckCircle2Icon class="w-4 h-4 text-primary" /> Multi-tenant isolation</li>
                  <li class="flex items-center gap-2"><CheckCircle2Icon class="w-4 h-4 text-primary" /> Best for MVP and testing</li>
                </ul>
                <p class="text-xs font-mono text-tertiary font-bold">$1.00 per 1M truths</p>
              </div>

              {/* Dedicated Pro Tier */}
              <div
                class={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${selectedTier.value === 'dedicated_l4' ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface-container-low hover:border-primary/50'}`}
                onClick$={() => selectedTier.value = 'dedicated_l4'}
              >
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="font-bold text-xl text-on-surface">Dedicated Pro</h3>
                    <p class="text-sm text-tertiary">Isolated Hardware</p>
                  </div>
                  <span class="rounded bg-orange-500/10 px-2 py-1 font-mono text-[10px] text-orange-400 font-bold uppercase tracking-widest">Single Tenant</span>
                </div>
                <ul class="text-sm text-tertiary space-y-2 mb-6">
                  <li class="flex items-center gap-2"><RocketIcon class="w-4 h-4 text-orange-400" /> Dedicated Container</li>
                  <li class="flex items-center gap-2"><LockIcon class="w-4 h-4 text-orange-400" /> Complete Data Isolation</li>
                  <li class="flex items-center gap-2"><ZapIcon class="w-4 h-4 text-orange-400" /> Zero Noisy Neighbors</li>
                </ul>
                <p class="text-xs font-mono text-tertiary font-bold">$400 / month flat rate</p>
              </div>
            </div>
          </section>

          <section class="mt-12 flex justify-end">
            <button
              type="submit"
              disabled={!clusterName.value}
              class="rounded-lg bg-primary px-8 py-3 font-bold text-on-primary transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedTier.value === 'fractional' ? 'Deploy Free Cluster' : 'Proceed to Checkout'}
            </button>
          </section>
        </Form>
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Deploy Cluster | ALETHEIA",
  description: "Deploy a new Aletheia cluster.",
  pathname: "/platform/clusters/new",
  noindex: true
});
