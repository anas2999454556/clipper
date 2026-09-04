import { NextResponse } from "next/server";
import db from "@/server/db";
import { getSession } from "@/server/auth";
import type { DBUser } from "@/server/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.userId) as DBUser | undefined;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        usageCount: user.usage_count,
        usageLimit: user.usage_limit,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
