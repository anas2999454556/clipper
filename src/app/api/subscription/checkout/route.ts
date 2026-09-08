import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/server/db";
import { requireAuth } from "@/server/api-helpers";
import { getStripe, getPriceId, appUrl, findOrCreateCustomer } from "@/server/stripe";
import { PLAN_MAP } from "@/lib/plans";
import type { PlanId } from "@/lib/plans";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { plan } = await request.json();
    if (plan !== "premium" && plan !== "super_premium") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = getPriceId(plan);

    const customerId = await findOrCreateCustomer({
      id: auth.ctx.user.id,
      email: auth.ctx.user.email,
      name: auth.ctx.user.name,
      stripeCustomerId: auth.ctx.user.stripe_customer_id,
    });

    if (auth.ctx.user.stripe_customer_id !== customerId) {
      const db = getDb();
      await db.prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?").bind(customerId, auth.ctx.user.id).run();
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: auth.ctx.user.id,
      metadata: { plan },
      subscription_data: {
        metadata: { userId: auth.ctx.user.id },
      },
      success_url: `${appUrl()}/pricing?success=1`,
      cancel_url: `${appUrl()}/pricing?canceled=1`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, plan: PLAN_MAP[plan as PlanId].name });
  } catch (error) {
    console.error("Checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to start checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
