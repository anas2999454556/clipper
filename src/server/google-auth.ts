const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const CACHE_TTL_MS = 60 * 60 * 1000;

interface CertCache {
  keys: JsonWebKey[];
  fetchedAt: number;
}

let certCache: CertCache | null = null;

interface GoogleIdTokenPayload {
  iss?: string;
  aud?: string;
  exp?: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  sub?: string;
}

export interface GoogleUserInfo {
  email: string;
  name: string | null;
  sub: string;
}

async function getGoogleKeys(): Promise<GoogleSigningKey[]> {
  if (certCache && Date.now() - certCache.fetchedAt < CACHE_TTL_MS) {
    return certCache.keys;
  }
  const response = await fetch(GOOGLE_CERTS_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch Google signing keys");
  }
  const data = (await response.json()) as { keys: GoogleSigningKey[] };
  certCache = { keys: data.keys, fetchedAt: Date.now() };
  return data.keys;
}

function base64urlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

interface GoogleSigningKey {
  kid?: string;
  alg?: string;
  kty?: string;
  n?: string;
  e?: string;
}

function decodeSegment<T>(segment: string): T {
  const text = new TextDecoder().decode(base64urlToBytes(segment));
  return JSON.parse(text) as T;
}

export async function verifyGoogleIdToken(
  credential: string,
  clientId: string
): Promise<GoogleUserInfo | null> {
  try {
    const parts = credential.split(".");
    if (parts.length !== 3) return null;
    const [headerSegment, payloadSegment, signatureSegment] = parts;

    const header = decodeSegment<{ alg?: string; kid?: string }>(headerSegment);
    const payload = decodeSegment<GoogleIdTokenPayload>(payloadSegment);

    const issuer = payload.iss;
    if (
      header.alg !== "RS256" ||
      payload.aud !== clientId ||
      (issuer !== "https://accounts.google.com" && issuer !== "accounts.google.com") ||
      typeof payload.exp !== "number" ||
      payload.exp * 1000 <= Date.now() ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return null;
    }

    const keys = await getGoogleKeys();
    const key = keys.find(
      (k) => k.kid === header.kid && k.alg === "RS256" && k.kty === "RSA"
    );
    if (!key || !key.n || !key.e) return null;

    const cryptoKey = await crypto.subtle.importKey(
      "jwk",
      { kty: "RSA", n: key.n, e: key.e },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const encoder = new TextEncoder();
    const signedData = encoder.encode(`${headerSegment}.${payloadSegment}`);
    const signature = base64urlToBytes(signatureSegment);
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      signature as unknown as BufferSource,
      signedData
    );
    if (!valid) return null;

    return {
      email: payload.email,
      name: payload.name ?? null,
      sub: payload.sub ?? "",
    };
  } catch {
    return null;
  }
}