import { NextResponse } from "next/server";
import { requireAuth } from "@/server/api-helpers";
import { getStripe, appUrl, findOrCreateCustomer } from "@/server/stripe";
import { isPaidPlan } from "@/lib/plans";

export async function POST() {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    if (!isPaidPlan(auth.ctx.user.plan)) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    const customerId = await findOrCreateCustomer({
      id: auth.ctx.user.id,
      email: auth.ctx.user.email,
      name: auth.ctx.user.name,
      stripeCustomerId: auth.ctx.user.stripe_customer_id,
    });

    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl()}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}
