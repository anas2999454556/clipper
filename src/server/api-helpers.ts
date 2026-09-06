import { NextRequest, NextResponse } from "next/server";
import db from "@/server/db";
import { getSession } from "@/server/auth";
import type { DBUser } from "@/server/db";
import { PLAN_MAP, isPaidPlan } from "@/lib/plans";
import type { PlanId } from "@/lib/plans";

export interface AuthContext {
  userId: string;
  email: string;
  user: DBUser;
}

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export async function requireAuth(): Promise<
  { ok: true; ctx: AuthContext } | { ok: false; response: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.userId) as DBUser | undefined;
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  return {
    ok: true,
    ctx: { userId: user.id, email: user.email, user },
  };
}

function resetDate(): string {
  return new Date(Date.now() + MONTH_MS).toISOString();
}

function syncUsageWindow(user: DBUser): void {
  const plan = PLAN_MAP[user.plan as PlanId] ?? PLAN_MAP.free;
  if (!plan.resetMonthly) {
    if (user.usage_reset_at) {
      db.prepare("UPDATE users SET usage_reset_at = NULL WHERE id = ?").run(user.id);
      user.usage_reset_at = null;
    }
    return;
  }

  if (!user.usage_reset_at || new Date(user.usage_reset_at).getTime() <= Date.now()) {
    const next = resetDate();
    db.prepare("UPDATE users SET usage_count = 0, usage_reset_at = ? WHERE id = ?").run(next, user.id);
    user.usage_count = 0;
    user.usage_reset_at = next;
  }
}

export function checkUsage(user: DBUser): { allowed: boolean; response?: NextResponse } {
  const plan = PLAN_MAP[user.plan as PlanId] ?? PLAN_MAP.free;

  if (plan.usageLimit === -1) return { allowed: true };

  syncUsageWindow(user);

  if (user.usage_count >= user.usage_limit) {
    const upgradeTo = isPaidPlan(plan.id) ? "Super Premium" : "Premium";
    const message =
      plan.id === "free"
        ? `Free plan allows ${user.usage_limit} video analyses. Upgrade to ${upgradeTo} for ${PLAN_MAP.premium.usageLabel.toLowerCase()}.`
        : `${plan.name} allows ${plan.usageLabel.toLowerCase()}. Upgrade to ${upgradeTo} for unlimited analyses.`;
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: "Usage limit reached",
          message,
          usageCount: user.usage_count,
          usageLimit: user.usage_limit,
        },
        { status: 403 }
      ),
    };
  }
  return { allowed: true };
}

export function incrementUsage(userId: string) {
  db.prepare("UPDATE users SET usage_count = usage_count + 1, updated_at = datetime('now') WHERE id = ?").run(userId);
}

export function applyPlan(
  userId: string,
  plan: PlanId,
  opts: { stripeCustomerId?: string | null; stripeSubscriptionId?: string | null } = {}
) {
  const info = PLAN_MAP[plan];
  db.prepare(
    `UPDATE users
     SET plan = ?, usage_limit = ?, usage_count = 0, usage_reset_at = ?,
         subscription_status = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(plan, info.usageLimit, info.resetMonthly ? resetDate() : null, isPaidPlan(plan) ? "active" : "none", userId);

  setStripeIds(userId, opts.stripeCustomerId, opts.stripeSubscriptionId);
}

export function syncStripePlan(
  userId: string,
  plan: PlanId,
  opts: { stripeCustomerId?: string | null; stripeSubscriptionId?: string | null } = {}
) {
  const info = PLAN_MAP[plan];
  db.prepare(
    `UPDATE users
     SET plan = ?, usage_limit = ?, subscription_status = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(plan, info.usageLimit, isPaidPlan(plan) ? "active" : "none", userId);

  setStripeIds(userId, opts.stripeCustomerId, opts.stripeSubscriptionId);
}

function setStripeIds(
  userId: string,
  stripeCustomerId?: string | null,
  stripeSubscriptionId?: string | null
) {
  if (stripeCustomerId) {
    db.prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?").run(stripeCustomerId, userId);
  }
  if (stripeSubscriptionId) {
    db.prepare("UPDATE users SET stripe_subscription_id = ? WHERE id = ?").run(stripeSubscriptionId, userId);
  }
}