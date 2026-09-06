import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import db from "@/server/db";
import { applyPlan, syncStripePlan } from "@/server/api-helpers";
import { getStripe, planFromPrice } from "@/server/stripe";
import type { PlanId } from "@/lib/plans";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription") break;

        const userId = session.client_reference_id;
        const plan = (session.metadata?.plan as PlanId | undefined) ?? null;
        if (!userId || !plan || (plan !== "premium" && plan !== "super_premium")) break;
        if (session.payment_status === "unpaid") break;

        applyPlan(userId, plan, {
          stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
        });

        if (typeof session.customer === "string") {
          await cancelPreviousSubscriptions(session.customer, typeof session.subscription === "string" ? session.subscription : null);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const user = db
          .prepare("SELECT id, stripe_subscription_id FROM users WHERE stripe_customer_id = ?")
          .get(customerId) as { id: string; stripe_subscription_id: string | null } | undefined;
        if (!user) break;

        const isActive = subscription.status === "active" || subscription.status === "trialing";
        const priceId = (subscription.items?.data?.[0]?.price?.id as string | undefined) ?? null;
        const plan = isActive ? planFromPrice(priceId ?? "") : null;
        const isCurrentSubscription = user.stripe_subscription_id === subscription.id;

        if (plan) {
          syncStripePlan(user.id, plan, { stripeCustomerId: customerId, stripeSubscriptionId: subscription.id });
        } else if (event.type === "customer.subscription.deleted" && isCurrentSubscription) {
          applyPlan(user.id, "free");
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function cancelPreviousSubscriptions(customerId: string, excludeSubscriptionId: string | null) {
  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 10,
  });

  for (const subscription of subscriptions.data) {
    if (subscription.id === excludeSubscriptionId) continue;
    try {
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
    } catch (err) {
      console.error("Failed to cancel previous subscription:", err);
    }
  }
}