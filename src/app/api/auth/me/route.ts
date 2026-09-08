import { NextResponse } from "next/server";
import { getDb, type DBUser } from "@/server/db";
import { getSession } from "@/server/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = getDb();
    const user = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(session.userId)
      .first<DBUser>();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        subscriptionStatus: user.subscription_status,
        usageCount: user.usage_count,
        usageLimit: user.usage_limit,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
