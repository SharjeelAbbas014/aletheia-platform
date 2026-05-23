import type { RequestHandler } from "@builder.io/qwik-city";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { getCurrentUser } from "~/lib/auth";
import { getStripeClient, createStripeCustomer } from "~/lib/stripe";
import { createCluster } from "~/lib/clusters";

export const onPost: RequestHandler = async (event) => {
  const user = getCurrentUser(event.cookie);
  if (!user) throw event.error(401, "Unauthorized");

  const body = (await event.parseBody()) as { tier?: string; name?: string } | null;
  const tier = body?.tier || "fractional";
  const name = (body?.name || "My Cluster").trim();

  const supabase = getAdminSupabaseClient(event.env);
  if (!supabase) throw event.error(500, "Internal Server Error - Database connection offline");

  // 1. Create the cluster in the database
  const cluster = await createCluster(event, name, tier);
  if (!cluster) throw event.error(500, "Failed to create cluster");

  // 2. Free tier — provision immediately and redirect to cluster page
  if (tier === "fractional") {
    throw event.redirect(302, `/platform/clusters/${cluster.id}`);
  }

  // Check if Stripe is in mock mode for local testing
  const stripeKey = event.env.get("STRIPE_SECRET_KEY") || "";
  const isMockStripe = !stripeKey || stripeKey.trim().startsWith("sk_test_...");

  // 3. Paid tier — create or get Stripe customer, then checkout
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.user_id)
    .maybeSingle();

  let customerId = existingSub?.stripe_customer_id;
  if (!customerId && !isMockStripe) {
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(user.user_id);
    if (authError || !authData?.user?.email) {
      throw event.error(400, "Could not retrieve user email for billing");
    }
    const customer = await createStripeCustomer(event.env, authData.user.email, { user_id: user.user_id });
    customerId = customer.id;
  } else if (isMockStripe && !customerId) {
    customerId = "cus_mock_123";
  }

  const vmConfigs: Record<string, { name: string; description: string; priceCents: number; size: string }> = {
    azure_micro: { name: "Developer Micro", description: "Azure Standard_B1s dedicated VM", priceCents: 1200, size: "Standard_B1s" },
    azure_standard: { name: "Agent Standard", description: "Azure Standard_B2s dedicated VM", priceCents: 4000, size: "Standard_B2s" },
    azure_pro: { name: "Production Core", description: "Azure Standard_D2as_v5 dedicated VM", priceCents: 9000, size: "Standard_D2as_v5" },
    azure_scale: { name: "Scale Master", description: "Azure Standard_D4as_v5 dedicated VM", priceCents: 17500, size: "Standard_D4as_v5" },
    azure_gpu: { name: "GPU Superbrain", description: "Azure Standard_NC4as_T4 dedicated VM", priceCents: 45000, size: "Standard_NC4as_T4" },
    dedicated_l4: { name: "Dedicated Pro", description: "Dedicated L4 instance, predictable pricing", priceCents: 40000, size: "Standard_NC6s_v3" },
  };

  const vmConfig = vmConfigs[tier];
  if (!vmConfig) {
    throw event.error(400, "Invalid tier selected for deployment");
  }

  // Update cluster status to provisioning for BYOC VM tiers
  if (vmConfig) {
    await supabase.from("clusters").update({
      tier,
      region: "eastus2",
      status: "provisioning",
    }).eq("id", cluster.id);
  }

  // Upsert subscription record
  await supabase.from("subscriptions").upsert({
    user_id: user.user_id,
    stripe_customer_id: customerId,
    tier,
    status: "incomplete",
    vm_size: vmConfig?.size || undefined,
    vm_monthly_price: vmConfig ? vmConfig.priceCents / 100 : undefined,
  }, { onConflict: "user_id" });

  if (isMockStripe) {
    if (vmConfig) {
      await supabase.from("clusters").update({
        tier,
        region: "eastus2",
        status: "active", // Provision immediately in mock mode
      }).eq("id", cluster.id);
    }

    await supabase.from("subscriptions").upsert({
      user_id: user.user_id,
      stripe_customer_id: "cus_mock_123",
      tier,
      status: "active",
      vm_size: vmConfig?.size || undefined,
      vm_monthly_price: vmConfig ? vmConfig.priceCents / 100 : undefined,
    }, { onConflict: "user_id" });

    throw event.redirect(302, `/platform/billing?success=true&mock=true`);
  }

  const stripe = getStripeClient(event.env);
  const origin = event.url.origin;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `AletheiaDB - ${vmConfig.name}`,
            description: vmConfig.description,
          },
          unit_amount: vmConfig.priceCents,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: { user_id: user.user_id, cluster_id: cluster.id, tier },
    },
    success_url: `${origin}/platform/billing?success=true`,
    cancel_url: `${origin}/platform/clusters/${cluster.id}?canceled=true`,
    metadata: { user_id: user.user_id, cluster_id: cluster.id, tier },
  });

  throw event.redirect(302, session.url!);
};
