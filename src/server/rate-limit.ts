import { getDb, type D1Database } from "@/server/db";

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

export async function checkRateLimit(
  key: string,
  db?: D1Database
): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const d = db ?? getDb();
  const now = Date.now();

  const row = await d
    .prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?")
    .bind(key)
    .first<{ count: number; reset_at: number }>();

  if (!row || now > row.reset_at) {
    await d
      .prepare("INSERT OR REPLACE INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)")
      .bind(key, now + WINDOW_MS)
      .run();
    return { allowed: true };
  }

  if (row.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.ceil((row.reset_at - now) / 1000) };
  }

  await d
    .prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?")
    .bind(key)
    .run();
  return { allowed: true };
}

export async function resetRateLimit(key: string, db?: D1Database) {
  const d = db ?? getDb();
  await d.prepare("DELETE FROM rate_limits WHERE key = ?").bind(key).run();
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
