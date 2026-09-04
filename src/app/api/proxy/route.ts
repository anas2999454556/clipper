import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/api-helpers";

// Block SSRF targets: loopback, private, link-local, multicast, and
// cloud metadata ranges (169.254.169.254).
function isBlockedTarget(host: string): boolean {
  const blocked =
    /^localhost$/i.test(host) ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^0\./.test(host) ||
    /^\[::1\]$/.test(host) ||
    /^\[[0-9a-fA-F:]+\]$/.test(host);
  return blocked;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only http/https URLs are allowed" }, { status: 400 });
  }

  if (isBlockedTarget(parsed.hostname)) {
    return NextResponse.json({ error: "This URL is not allowed" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        Range: request.headers.get("range") || "",
      },
    });

    if (!response.ok && response.status !== 206) {
      return NextResponse.json({ error: "Failed to fetch video" }, { status: 502 });
    }

    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");

    if (contentType) headers.set("Content-Type", contentType);
    if (contentLength) headers.set("Content-Length", contentLength);
    if (contentRange) headers.set("Content-Range", contentRange);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(response.body, {
      status: response.status === 206 ? 206 : 200,
      headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
