import { component$ } from "@builder.io/qwik";
import { routeLoader$, Link, type DocumentHead } from "@builder.io/qwik-city";
import { ArrowLeftIcon, CheckIcon, ExternalLinkIcon, CreditCardIcon } from "lucide-qwik";
import { buildSeoHead } from "~/lib/seo";
import { setPrivateNoStore } from "~/lib/cache";
import type { RequestHandler } from "@builder.io/qwik-city";
import { getSubscription } from "~/lib/subscriptions";
import { requireAuth } from "~/lib/auth";

export const onRequest: RequestHandler = (event) => {
  setPrivateNoStore(event);
};

export const useBillingData = routeLoader$(async (event) => {
  const user = requireAuth(event);
  const sub = await getSubscription(event);
  return { user, sub };
});

const plans = [
  {
    id: "fractional",
    name: "Fractional",
    price: "$1.00",
    unit: "/1M truths",
    description: "Pay-as-you-go, shared infrastructure",
    features: ["10K requests/day", "50 MB storage", "Basic query & ingest", "Shared compute", "Community support"],
    cta: "Current Plan",
    highlighted: false,
  },
  {
    id: "dedicated_l4",
    name: "Dedicated Pro",
    price: "$400",
    unit: "/month",
    description: "Dedicated L4 instance, predictable pricing",
    features: ["100K requests/day", "4 GB storage", "Graph visualization", "Analytics dashboard", "Priority support", "99.9% SLA"],
    cta: "Upgrade",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    unit: "",
    description: "Custom deployment, on-premise option",
    features: ["Unlimited requests", "Unlimited storage", "Dedicated infrastructure", "Custom SLA", "On-premise option", "24/7 support"],
    cta: "Contact Sales",
    highlighted: false,
    contact: true,
  },
];

export default component$(() => {
  const data = useBillingData();
  const sub = data.value.sub;

  return (
    <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
      <main class="flex-1 overflow-y-auto p-8 lg:p-12 mb-20 max-w-5xl mx-auto w-full pt-[104px]">
        <header class="mb-12">
          <Link href="/platform" class="text-tertiary hover:text-primary flex items-center gap-1 transition-colors w-fit">
            <ArrowLeftIcon class="w-4 h-4" />
            Mission Control
          </Link>
          <h1 class="font-headline text-4xl font-extrabold tracking-tighter text-on-surface mt-4">Billing</h1>
          <p class="text-tertiary mt-2">Manage your plan and usage</p>
        </header>

        {/* Current Plan Info */}
        {sub && (
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 mb-8">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-bold uppercase tracking-widest text-tertiary mb-1">Current Plan</p>
                <p class="text-2xl font-bold capitalize">{sub.tier?.replace("_", " ") || "Fractional"}</p>
                <p class="text-sm text-tertiary mt-1">
                  Status: <span class="capitalize text-green-400 font-medium">{sub.status}</span>
                </p>
              </div>
              {sub.stripe_customer_id && (
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
            {sub.current_period_end && (
              <p class="text-xs text-tertiary mt-3">
                Current period ends: {new Date(sub.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Plan Cards */}
        <div class="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = sub?.tier === plan.id;
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
                  <form method="post" action="/api/billing/checkout">
                    <input type="hidden" name="tier" value={plan.id} />
                    <button type="submit" class="w-full py-3 px-4 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity">
                      {plan.cta}
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Billing | ALETHEIADB",
  description: "Manage your billing and subscription.",
  pathname: "/platform/billing",
  noindex: true
});
