"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleButton from "@/components/GoogleButton";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreed) {
      setError("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, website }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      router.push("/upload");
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm animate-fade-in">
        <h1 className="text-headline mb-3 text-center">Create account</h1>
        <p className="text-muted-foreground text-sm mb-8 text-center">
          Start with 5 free video analyses
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="hidden" aria-hidden="true">
            <label htmlFor="signup-website">Website</label>
            <input
              id="signup-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium mb-1.5">Name</label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              id="signup-agree"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border bg-muted accent-white"
            />
            <label htmlFor="signup-agree" className="text-sm text-muted-foreground leading-snug">
              I agree to the{" "}
              <Link href="/terms" className="text-foreground underline" target="_blank">Terms &amp; Conditions</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-foreground underline" target="_blank">Privacy Policy</Link>.
            </label>
          </div>

          {error && (
            <p className="text-sm" role="alert" style={{ color: "#dc2626" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-3 font-semibold text-sm transition-colors disabled:opacity-30"
            style={{ background: "#ffffff", color: "#000000" }}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton />

        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}