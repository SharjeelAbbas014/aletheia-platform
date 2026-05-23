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

        <form action="/api/billing/checkout" method="post">
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
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: "fractional",
                  name: "Fractional",
                  subName: "Shared Serverless",
                  badge: "Free Tier",
                  badgeClass: "bg-primary/10 text-primary",
                  features: [
                    "Free 10K truths/month",
                    "Pay-per-token refills",
                    "Shared CPU substrate",
                    "Zero cold starts"
                  ],
                  priceText: "Free + Prepaid Credit"
                },
                {
                  id: "azure_micro",
                  name: "Developer Micro",
                  subName: "Azure Standard_B1s",
                  badge: "Dedicated VM",
                  badgeClass: "bg-green-500/10 text-green-400",
                  features: [
                    "1 vCPU | 1 GiB RAM",
                    "Dedicated instance",
                    "Aletheia cut included",
                    "Best for sandboxing & dev"
                  ],
                  priceText: "$12.00 / month"
                },
                {
                  id: "azure_standard",
                  name: "Agent Standard",
                  subName: "Azure Standard_B2s",
                  badge: "Production VM",
                  badgeClass: "bg-blue-500/10 text-blue-400",
                  features: [
                    "2 vCPUs | 4 GiB RAM",
                    "Multi-agent core",
                    "Isolated SQLite index",
                    "Fast vector search"
                  ],
                  priceText: "$40.00 / month"
                },
                {
                  id: "azure_pro",
                  name: "Production Core",
                  subName: "Azure Standard_D2as_v5",
                  badge: "High Performance",
                  badgeClass: "bg-orange-500/10 text-orange-400",
                  features: [
                    "2 vCPUs | 8 GiB RAM",
                    "50 GB Premium SSD",
                    "Dedicated prod load",
                    "Zero noisy neighbors"
                  ],
                  priceText: "$90.00 / month"
                },
                {
                  id: "azure_scale",
                  name: "Scale Master",
                  subName: "Azure Standard_D4as_v5",
                  badge: "Enterprise VM",
                  badgeClass: "bg-purple-500/10 text-purple-400",
                  features: [
                    "4 vCPUs | 16 GiB RAM",
                    "100 GB Premium SSD",
                    "Massive graph crawls",
                    "Local re-ranking models"
                  ],
                  priceText: "$175.00 / month"
                },
                {
                  id: "azure_gpu",
                  name: "GPU Superbrain",
                  subName: "Azure Standard_NC4as_T4",
                  badge: "GPU Accelerated",
                  badgeClass: "bg-rose-500/10 text-rose-400",
                  features: [
                    "4 vCPUs | 28 GiB RAM",
                    "1 NVIDIA T4 GPU",
                    "Ultra-low latency embeddings",
                    "Local re-ranking inference"
                  ],
                  priceText: "$450.00 / month"
                }
              ].map((tier) => {
                const isSelected = selectedTier.value === tier.id;
                return (
                  <div
                    key={tier.id}
                    class={`cursor-pointer rounded-2xl border-2 p-5 flex flex-col justify-between transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface-container-low hover:border-primary/50'}`}
                    onClick$={() => selectedTier.value = tier.id}
                  >
                    <div>
                      <div class="flex justify-between items-start mb-3">
                        <div>
                          <h3 class="font-bold text-lg text-on-surface">{tier.name}</h3>
                          <p class="text-xs text-tertiary">{tier.subName}</p>
                        </div>
                        <span class={`rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${tier.badgeClass}`}>{tier.badge}</span>
                      </div>
                      <ul class="text-xs text-tertiary space-y-2 mb-6">
                        {tier.features.map((f, i) => (
                          <li key={i} class="flex items-center gap-1.5">
                            <CheckCircle2Icon class="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p class="text-xs font-mono text-on-surface font-bold border-t border-outline-variant/10 pt-3 mt-auto">{tier.priceText}</p>
                  </div>
                );
              })}
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
        </form>
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Deploy Cluster | ALETHEIADB",
  description: "Deploy a new AletheiaDB cluster.",
  pathname: "/platform/clusters/new",
  noindex: true
});
