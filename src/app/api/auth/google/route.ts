import { NextRequest, NextResponse } from "next/server";
import { getDb, type DBUser } from "@/server/db";
import { hashPassword, signToken, setAuthCookie } from "@/server/auth";
import { checkRateLimit, clientIp } from "@/server/rate-limit";
import { verifyGoogleIdToken } from "@/server/google-auth";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
    }

    const ip = clientIp(request);
    const ipLimit = await checkRateLimit(`google:ip:${ip}`);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSec) } }
      );
    }

    const { credential } = await request.json();
    if (typeof credential !== "string" || !credential) {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 });
    }

    const info = await verifyGoogleIdToken(credential, clientId);
    if (!info) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }

    const db = getDb();
    const email = info.email.toLowerCase();
    let user = await db
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first<DBUser>();

    if (!user) {
      const id = uuid();
      const placeholder = await hashPassword(uuid());
      await db
        .prepare(
          "INSERT INTO users (id, email, password, name, plan, usage_count, usage_limit) VALUES (?, ?, ?, ?, 'free', 0, 5)"
        )
        .bind(id, email, placeholder, info.name)
        .run();
      user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<DBUser>();
    }

    const token = await signToken({ userId: user!.id, email });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        plan: user!.plan,
        subscriptionStatus: user!.subscription_status,
        usageCount: user!.usage_count,
        usageLimit: user!.usage_limit,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Failed to sign in with Google" }, { status: 500 });
  }
}
