import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/server/db";
import { hashPassword, signToken, setAuthCookie } from "@/server/auth";
import { checkRateLimit, clientIp } from "@/server/rate-limit";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    const ipLimit = await checkRateLimit(`signup:ip:${ip}`);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSec) } }
      );
    }

    const { email, password, name, website } = await request.json();

    if (website) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    if (typeof name === "string" && name.length > 50) {
      return NextResponse.json({ error: "Name must be 50 characters or fewer" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const db = getDb();

    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(normalizedEmail).first();
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const id = uuid();
    const hashedPassword = await hashPassword(password);

    await db
      .prepare(
        "INSERT INTO users (id, email, password, name, plan, usage_count, usage_limit) VALUES (?, ?, ?, ?, 'free', 0, 5)"
      )
      .bind(id, normalizedEmail, hashedPassword, name || null)
      .run();

    const token = await signToken({ userId: id, email: normalizedEmail });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: { id, email: normalizedEmail, name: name || null, plan: "free", subscriptionStatus: "none", usageCount: 0, usageLimit: 5 },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
