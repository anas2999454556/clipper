import Stripe from "stripe";
import type { PlanId } from "@/lib/plans";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!_stripe) {
    _stripe = new Stripe(secretKey);
  }
  return _stripe;
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getPriceId(plan: PlanId): string {
  if (plan === "free") {
    throw new Error("Free plan has no Stripe price");
  }
  const priceId =
    plan === "premium" ? process.env.STRIPE_PRICE_PREMIUM : process.env.STRIPE_PRICE_SUPER_PREMIUM;
  if (!priceId) {
    throw new Error(`STRIPE_PRICE_${plan === "premium" ? "PREMIUM" : "SUPER_PREMIUM"} is not configured`);
  }
  return priceId;
}

export function planFromPrice(priceId: string): PlanId | null {
  if (priceId === process.env.STRIPE_PRICE_PREMIUM) return "premium";
  if (priceId === process.env.STRIPE_PRICE_SUPER_PREMIUM) return "super_premium";
  return null;
}

export async function findOrCreateCustomer(user: {
  id: string;
  email: string;
  name: string | null;
  stripeCustomerId: string | null;
}): Promise<string> {
  const stripe = getStripe();
  if (user.stripeCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(user.stripeCustomerId);
      if (!("deleted" in existing) || !existing.deleted) {
        return user.stripeCustomerId;
      }
    } catch {
      // fall through and create a fresh customer
    }
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId: user.id },
  });
  return customer.id;
}