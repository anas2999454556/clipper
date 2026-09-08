import bcrypt from "bcryptjs";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET is not set. Generate a strong secret (32+ chars) and add it to .env"
    );
  }
  return secret;
}

const COOKIE_NAME = "clipper_token";
const TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
}

function base64urlEncode(data: string): string {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(data: string): string {
  const padded = data.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return binary;
}

async function getKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(getJwtSecret());
  return crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: JWTPayload): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + TOKEN_EXPIRY_SECONDS };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const bodyB64 = base64urlEncode(JSON.stringify(body));
  const data = `${headerB64}.${bodyB64}`;

  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const sigB64 = base64urlEncode(String.fromCharCode(...new Uint8Array(signature)));

  return `${data}.${sigB64}`;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, bodyB64, sigB64] = parts;

    const data = `${headerB64}.${bodyB64}`;
    const key = await getKey();

    const sigBytes = Uint8Array.from(base64urlDecode(sigB64), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(data));
    if (!valid) return null;

    const body = JSON.parse(base64urlDecode(bodyB64));
    if (typeof body !== "object" || body === null) return null;
    if (typeof body.exp !== "number" || body.exp * 1000 <= Date.now()) return null;
    if (typeof body.userId !== "string" || typeof body.email !== "string") return null;

    return { userId: body.userId, email: body.email };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_EXPIRY_SECONDS,
    path: "/",
  });
}

export async function removeAuthCookie() {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<JWTPayload | null> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
