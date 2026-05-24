import type { RequestHandler } from "@builder.io/qwik-city";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { upsertSubscription } from "~/lib/subscriptions";
import { constructWebhookEvent, retrieveStripeSubscription } from "~/lib/stripe";

export const onPost: RequestHandler = async (event) => {
  const rawBody = await event.request.clone().text();
  const signature = event.request.headers.get("stripe-signature") || "";

  if (!signature) throw event.error(400, "Missing stripe-signature");

  const webhookSecret = event.env.get("STRIPE_WEBHOOK_SECRET") || "";
  if (!webhookSecret) throw event.error(500, "STRIPE_WEBHOOK_SECRET not configured");

  let stripeEvent;
  try {
    stripeEvent = await constructWebhookEvent(event.env, rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe Webhook] Verification failed", {
      bodyLength: rawBody.length,
      signaturePrefix: signature.slice(0, 20),
      secretPrefix: webhookSecret.slice(0, 12),
      error: err.message,
    });
    throw event.error(400, `Webhook error: ${err.message}`);
  }

  const supabase = getAdminSupabaseClient(event.env);
  if (!supabase) throw event.error(500, "Database connection offline");

  switch (stripeEvent.type) {
    case "checkout.session.completed": {
      const session = stripeEvent.data.object;
      const userId = session.metadata?.user_id;
      const clusterId = session.metadata?.cluster_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      const isPrepaid = session.metadata?.type === "prepaid_tokens";
      if (isPrepaid) {
        const tokenCount = parseInt(session.metadata?.token_count || "0", 10);
        if (userId && tokenCount > 0) {
          try {
            const { data: sub } = await supabase
              .from("subscriptions")
              .select("token_balance")
              .eq("user_id", userId)
              .maybeSingle();

            const currentBalance = sub?.token_balance ?? 10000;
            await supabase.from("subscriptions").upsert({
              user_id: userId,
              token_balance: currentBalance + tokenCount,
              stripe_customer_id: customerId || undefined,
              tier: "fractional",
              status: "active",
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

            // Record purchase
            await supabase.from("purchases").insert({
              user_id: userId,
              amount: (session.amount_total || 500) / 100,
              description: `Prepaid Credits - Refill ${tokenCount.toLocaleString()} truths`,
            });
          } catch (err) {
            console.error("Failed to credit prepaid tokens:", err);
          }
        }
      } else if (userId && subscriptionId) {
        try {
          const sub = await retrieveStripeSubscription(event.env, subscriptionId);
          const priceId = sub.items.data[0]?.price.id;
          const tier = (sub.metadata?.tier as string) || sub.items.data[0]?.price.nickname?.toLowerCase() || "dedicated_l4";
          const storageGb = parseInt(sub.metadata?.storage_gb || "50", 10);
          const vmSize = {
            azure_micro: "Standard_B1s",
            azure_standard: "Standard_B2s",
            azure_pro: "Standard_D2as_v5",
            azure_scale: "Standard_D4as_v5",
            azure_gpu: "Standard_NC4as_T4",
            dedicated_l4: "Standard_NV4as_v4",
          }[tier];

          const vmMonthlyPrice = (sub.items.data[0]?.price.unit_amount || 0) / 100;
          await upsertSubscription(event.env, userId, {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            tier,
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            vm_size: vmSize || undefined,
            vm_monthly_price: vmMonthlyPrice,
            storage_gb: storageGb,
          });

          // Record purchase
          await supabase.from("purchases").insert({
            user_id: userId,
            amount: vmMonthlyPrice,
            description: `AletheiaDB - Dedicated VM (${tier.replace("_", " ")}, ${storageGb} GB Storage)`,
          });

          // Update cluster with tier and storage capacity, but do NOT set status: "active"
          if (clusterId) {
            await supabase
              .from("clusters")
              .update({ tier, storage_gb: storageGb })
              .eq("id", clusterId);
          }
        } catch (err) {
          console.error("Webhook processing failed for subscription:", err);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = stripeEvent.data.object;
      const subId = sub.id;
      const priceId = sub.items.data[0]?.price.id;
      const tier = (sub.metadata?.tier as string) || sub.items.data[0]?.price.nickname?.toLowerCase() || "dedicated_l4";

      await supabase
        .from("subscriptions")
        .update({
          stripe_price_id: priceId,
          tier,
          status: sub.status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subId);
      break;
    }

    case "customer.subscription.deleted": {
      const deleted = stripeEvent.data.object;
      await supabase
        .from("subscriptions")
        .update({ status: "canceled", tier: "fractional", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", deleted.id);
      break;
    }
  }

  event.json(200, { received: true });
};
