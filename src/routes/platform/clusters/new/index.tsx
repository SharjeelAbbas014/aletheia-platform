import { component$, useSignal } from "@builder.io/qwik";
import { Form, Link, type DocumentHead, useLocation } from "@builder.io/qwik-city";
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
  const loc = useLocation();
  const initialTier = loc.url.searchParams.get("tier") || "fractional";
  const selectedTier = useSignal<string>(initialTier);
  const clusterName = useSignal<string>('');
  const storageGb = useSignal<number>(50);

  const vmPrices: Record<string, number> = {
    azure_micro: 1200,
    azure_standard: 4000,
    azure_pro: 9000,
    azure_scale: 17500,
    azure_gpu: 45000,
    dedicated_l4: 40000,
  };

  const getButtonText = () => {
    if (selectedTier.value === 'fractional') return 'Deploy Free Cluster';
    const basePriceCents = vmPrices[selectedTier.value] || 0;
    const storagePriceCents = storageGb.value * 15;
    const totalCents = basePriceCents + storagePriceCents;
    return `Pay $${(totalCents / 100).toFixed(2)} / month`;
  };

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
            <h2 class="text-xl font-bold mb-4">2. Select Azure Region</h2>
            <select
              name="region"
              class="w-full rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors max-w-md cursor-pointer"
              required
            >
              <option value="eastus" selected>East US (Virginia)</option>
              <option value="westus2">West US 2 (Washington)</option>
              <option value="northeurope">North Europe (Ireland)</option>
              <option value="westeurope">West Europe (Netherlands)</option>
              <option value="southeastasia">Southeast Asia (Singapore)</option>
            </select>
          </section>

          <section class="mb-12">
            <h2 class="text-xl font-bold mb-4">3. Select Compute Tier</h2>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: "fractional",
                  name: "Fractional",
                  subName: "Shared Engine",
                  badge: "Shared Cloud",
                  badgeClass: "bg-primary/10 text-primary",
                  features: [
                    "Hosted on engine.aletheiadb.com",
                    "Shared database substrate",
                    "Free 10K truths/month",
                    "Access via global API"
                  ],
                  priceText: "Free + Prepaid Refills"
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
                  id: "dedicated_l4",
                  name: "Dedicated Pro",
                  subName: "Azure Standard_NV4as_v4",
                  badge: "GPU VM",
                  badgeClass: "bg-red-500/10 text-red-400",
                  features: [
                    "4 vCPUs | 14 GiB RAM",
                    "1/8 AMD Radeon Pro V320 GPU",
                    "Hardware accelerated hosting",
                    "Dedicated memory engine"
                  ],
                  priceText: "$400.00 / month"
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
                  <label
                    key={tier.id}
                    class={`cursor-pointer rounded-2xl border-2 p-5 flex flex-col justify-between transition-all relative ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface-container-low hover:border-primary/50'}`}
                    onClick$={() => { selectedTier.value = tier.id; }}
                  >
                    <div>
                      <div class="flex justify-between items-start mb-3">
                        <div>
                          <h3 class="font-bold text-lg text-on-surface">{tier.name}</h3>
                          <p class="text-xs text-tertiary">{tier.subName}</p>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class={`rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${tier.badgeClass}`}>{tier.badge}</span>
                          <input
                            type="radio"
                            name="tier"
                            value={tier.id}
                            checked={isSelected}
                            onChange$={() => { selectedTier.value = tier.id; }}
                            class="h-4 w-4 accent-primary cursor-pointer shrink-0"
                          />
                        </div>
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
                  </label>
                );
              })}
            </div>
          </section>

          {selectedTier.value !== 'fractional' && (
            <section class="mb-12">
              <h2 class="text-xl font-bold mb-2">4. Configure Dedicated Storage</h2>
              <p class="text-xs text-tertiary mb-4">Select the SSD storage capacity for your database VM ($0.15 per GB / month).</p>
              <div class="flex items-center gap-6 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 max-w-xl">
                <div class="flex-grow">
                  <input
                    type="range"
                    name="storage_gb"
                    min="10"
                    max="1000"
                    step="10"
                    bind:value={storageGb}
                    class="w-full accent-primary cursor-pointer"
                  />
                  <div class="flex justify-between text-[10px] text-tertiary font-bold mt-2 font-mono">
                    <span>10 GB</span>
                    <span>250 GB</span>
                    <span>500 GB</span>
                    <span>750 GB</span>
                    <span>1000 GB (1 TB)</span>
                  </div>
                </div>
                <div class="text-center bg-black/30 border border-outline-variant/10 px-6 py-4 rounded-xl shrink-0 min-w-[120px]">
                  <p class="text-2xl font-extrabold font-mono text-on-surface">{storageGb.value} GB</p>
                  <p class="text-[10px] text-primary font-bold mt-1">+${(storageGb.value * 0.15).toFixed(2)}/mo</p>
                </div>
              </div>
            </section>
          )}

          <section class="mt-12 flex justify-end">
            <button
              type="submit"
              disabled={!clusterName.value}
              class="rounded-lg bg-primary px-8 py-3 font-bold text-on-primary transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getButtonText()}
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
