import type { RequestHandler } from "@builder.io/qwik-city";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { getCurrentUser } from "~/lib/auth";
import { createCheckoutSession, createStripeCustomer } from "~/lib/stripe";
import { createCluster } from "~/lib/clusters";

export const onPost: RequestHandler = async (event) => {
  const user = getCurrentUser(event.cookie);
  if (!user) throw event.error(401, "Unauthorized");

  const body = await event.parseBody<{ tier?: string; name?: string }>();
  const tier = body?.tier || "fractional";
  const name = (body?.name || "My Cluster").trim();

  const supabase = getAdminSupabaseClient(event.env);

  // 1. Create the cluster in the database
  const cluster = await createCluster(event, name, tier);
  if (!cluster) throw event.error(500, "Failed to create cluster");

  // 2. Free tier — provision immediately and redirect to cluster page
  if (tier === "fractional") {
    throw event.redirect(302, `/platform/clusters/${cluster.id}`);
  }

  // 3. Paid tier — create or get Stripe customer, then checkout
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.user_id)
    .single();

  let customerId = existingSub?.stripe_customer_id;
  if (!customerId) {
    const customer = await createStripeCustomer(event.env, user.username, { user_id: user.user_id });
    customerId = customer.id;
  }

  // Insert subscription record
  await supabase.from("subscriptions").upsert({
    user_id: user.user_id,
    stripe_customer_id: customerId,
    tier,
    status: "incomplete",
  }, { onConflict: "user_id" });

  const priceIds: Record<string, string> = {
    dedicated_l4: event.env.get("PUBLIC_STRIPE_PRO_PRICE_ID") || "",
  };
  const priceId = priceIds[tier];
  if (!priceId) throw event.error(400, "Invalid tier for paid checkout");

  const origin = event.url.origin;
  const session = await createCheckoutSession(
    event.env,
    customerId,
    priceId,
    `${origin}/platform/billing?success=true`,
    `${origin}/platform/clusters/${cluster.id}?canceled=true`,
    { user_id: user.user_id, cluster_id: cluster.id }
  );

  throw event.redirect(302, session.url!);
};
