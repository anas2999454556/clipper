import { NextResponse } from "next/server";
import { getDb, type DBUser } from "@/server/db";
import { getSession } from "@/server/auth";
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

  const db = getDb();
  const user = await db
    .prepare("SELECT * FROM users WHERE id = ?")
    .bind(session.userId)
    .first<DBUser>();
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

async function syncUsageWindow(user: DBUser): Promise<void> {
  const db = getDb();
  const plan = PLAN_MAP[user.plan as PlanId] ?? PLAN_MAP.free;
  if (!plan.resetMonthly) {
    if (user.usage_reset_at) {
      await db.prepare("UPDATE users SET usage_reset_at = NULL WHERE id = ?").bind(user.id).run();
      user.usage_reset_at = null;
    }
    return;
  }

  if (!user.usage_reset_at || new Date(user.usage_reset_at).getTime() <= Date.now()) {
    const next = resetDate();
    await db
      .prepare("UPDATE users SET usage_count = 0, usage_reset_at = ? WHERE id = ?")
      .bind(next, user.id)
      .run();
    user.usage_count = 0;
    user.usage_reset_at = next;
  }
}

export async function checkUsage(user: DBUser): Promise<{ allowed: boolean; response?: NextResponse }> {
  const plan = PLAN_MAP[user.plan as PlanId] ?? PLAN_MAP.free;

  if (plan.usageLimit === -1) return { allowed: true };

  await syncUsageWindow(user);

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

export async function incrementUsage(userId: string) {
  const db = getDb();
  await db
    .prepare("UPDATE users SET usage_count = usage_count + 1, updated_at = datetime('now') WHERE id = ?")
    .bind(userId)
    .run();
}

export async function applyPlan(
  userId: string,
  plan: PlanId,
  opts: { stripeCustomerId?: string | null; stripeSubscriptionId?: string | null } = {}
) {
  const db = getDb();
  const info = PLAN_MAP[plan];
  await db
    .prepare(
      `UPDATE users
       SET plan = ?, usage_limit = ?, usage_count = 0, usage_reset_at = ?,
           subscription_status = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(plan, info.usageLimit, info.resetMonthly ? resetDate() : null, isPaidPlan(plan) ? "active" : "none", userId)
    .run();

  await setStripeIds(userId, opts.stripeCustomerId, opts.stripeSubscriptionId);
}

export async function syncStripePlan(
  userId: string,
  plan: PlanId,
  opts: { stripeCustomerId?: string | null; stripeSubscriptionId?: string | null } = {}
) {
  const db = getDb();
  const info = PLAN_MAP[plan];
  await db
    .prepare(
      `UPDATE users
       SET plan = ?, usage_limit = ?, subscription_status = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(plan, info.usageLimit, isPaidPlan(plan) ? "active" : "none", userId)
    .run();

  await setStripeIds(userId, opts.stripeCustomerId, opts.stripeSubscriptionId);
}

async function setStripeIds(
  userId: string,
  stripeCustomerId?: string | null,
  stripeSubscriptionId?: string | null
) {
  const db = getDb();
  if (stripeCustomerId) {
    await db.prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?").bind(stripeCustomerId, userId).run();
  }
  if (stripeSubscriptionId) {
    await db.prepare("UPDATE users SET stripe_subscription_id = ? WHERE id = ?").bind(stripeSubscriptionId, userId).run();
  }
}
