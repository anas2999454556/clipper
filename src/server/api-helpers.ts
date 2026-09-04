import { NextRequest, NextResponse } from "next/server";
import db from "@/server/db";
import { getSession } from "@/server/auth";
import type { DBUser } from "@/server/db";

export interface AuthContext {
  userId: string;
  email: string;
  user: DBUser;
}

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

export function checkUsage(user: DBUser): { allowed: boolean; response?: NextResponse } {
  if (user.plan === "pro") return { allowed: true };
  if (user.usage_count >= user.usage_limit) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: "Usage limit reached",
          message: `Free plan allows ${user.usage_limit} video analyses. Upgrade to Pro for unlimited.`,
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
