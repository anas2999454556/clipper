import { NextRequest, NextResponse } from "next/server";
import db from "@/server/db";
import { verifyPassword, signToken, setAuthCookie } from "@/server/auth";
import { checkRateLimit, resetRateLimit, clientIp } from "@/server/rate-limit";
import type { DBUser } from "@/server/db";

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    const ipLimit = checkRateLimit(`login:ip:${ip}`);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSec) } }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const emailLimit = checkRateLimit(`login:email:${normalizedEmail}`);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSec) } }
      );
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail) as DBUser | undefined;
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    resetRateLimit(`login:email:${normalizedEmail}`);
    const token = signToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
