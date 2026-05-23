import type { RequestHandler } from "@builder.io/qwik-city";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { upsertSubscription } from "~/lib/subscriptions";
import { constructWebhookEvent, retrieveStripeSubscription } from "~/lib/stripe";

export const onPost: RequestHandler = async (event) => {
  const rawBody = await event.request.text();
  const signature = event.request.headers.get("stripe-signature") || "";

  if (!signature) throw event.error(400, "Missing stripe-signature");

  let stripeEvent;
  try {
    stripeEvent = await constructWebhookEvent(event.env, rawBody, signature);
  } catch (err: any) {
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
          } catch (err) {
            console.error("Failed to credit prepaid tokens:", err);
          }
        }
      } else if (userId && subscriptionId) {
        try {
          const sub = await retrieveStripeSubscription(event.env, subscriptionId);
          const priceId = sub.items.data[0]?.price.id;
          const tier = (sub.metadata?.tier as string) || sub.items.data[0]?.price.nickname?.toLowerCase() || "dedicated_l4";

          await upsertSubscription(event.env, userId, {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            tier,
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          });

          // Activate the cluster if it was in provisioning
          if (clusterId) {
            await supabase
              .from("clusters")
              .update({ status: "active", tier })
              .eq("id", clusterId);
          }
        } catch {
          // Log and continue — don't fail the webhook
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
