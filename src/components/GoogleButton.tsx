"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCookieConsent } from "@/components/CookieConsent";

interface GoogleId {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: { credential: string }) => void;
        auto_select?: boolean;
      }) => void;
      renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function GoogleButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (!CLIENT_ID || consent !== true) return;

    const windowWithGoogle = window as unknown as { google?: GoogleId };

    async function handleCredential(response: { credential: string }) {
      setError(null);
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Google sign-in failed");
          return;
        }
        router.push("/upload");
      } catch {
        setError("Network error. Please try again.");
      }
    }

    function startGoogle() {
      const gis = windowWithGoogle.google;
      const parent = containerRef.current;
      if (!gis?.accounts?.id || !parent) return;

      gis.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
      });
      gis.accounts.id.renderButton(parent, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: parent.clientWidth || 340,
      });
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = startGoogle;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [router]);

  if (!CLIENT_ID || consent !== true) return null;

  return (
    <div>
      {error && (
        <p className="text-sm mb-3 text-center" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}
      <div ref={containerRef} className="w-full flex justify-center [&_iframe]:w-full!" />
    </div>
  );
}