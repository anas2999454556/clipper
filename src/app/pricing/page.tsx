"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { PLANS, isPaidPlan } from "@/lib/plans";
import type { PlanId } from "@/lib/plans";
import { useAuth } from "@/hooks/useAuth";

export default function PricingPage() {
  return (
    <Suspense fallback={<main className="flex-1 h-64" />}>
      <Pricing />
    </Suspense>
  );
}

function Pricing() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingOut, setCheckingOut] = useState<PlanId | null>(null);
  const [billingUrl, setBillingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openedPortal = searchParams.get("opened_portal") === "1";
  const succeeded = searchParams.get("success") === "1";
  const canceled = searchParams.get("canceled") === "1";

  useEffect(() => {
    if (openedPortal && user) {
      fetch("/api/subscription/portal", { method: "POST" })
        .then((r) => r.json())
        .then((data) => {
          if (data.url) window.location.href = data.url;
        });
    }
  }, [openedPortal, user]);

  const handleCheckout = useCallback(
    async (plan: PlanId) => {
      if (plan === "free") return;
      setError(null);
      setCheckingOut(plan);
      try {
        const res = await fetch("/api/subscription/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          setError(data.error || "Could not start checkout");
          setCheckingOut(null);
          return;
        }
        window.location.href = data.url;
      } catch {
        setError("Network error. Please try again.");
        setCheckingOut(null);
      }
    },
    []
  );

  const handleManage = useCallback(() => {
    setError(null);
    setBillingUrl("opening");
    fetch("/api/subscription/portal", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.url) window.location.href = data.url;
        else {
          setBillingUrl(null);
          setError("Could not open billing portal");
        }
      })
      .catch(() => {
        setBillingUrl(null);
        setError("Could not open billing portal");
      });
  }, []);

  return (
    <main className="flex-1 px-6 md:px-10 py-20">
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="text-center mb-16">
          <h1 className="text-headline mb-3">Simple pricing</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Start free, upgrade when you need more. Cancel anytime.
          </p>
        </div>

        {succeeded && (
          <p className="text-center text-sm mb-8" style={{ color: "#4ade80" }}>
            Subscription active. Welcome aboard.
          </p>
        )}
        {canceled && (
          <p className="text-center text-sm mb-8 text-muted-foreground">
            Checkout canceled. No changes were made.
          </p>
        )}
        {error && (
          <p className="text-center text-sm mb-8" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => {
            const isCurrent = user?.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-8 flex flex-col ${
                  plan.highlighted ? "border-accent bg-card" : "border-border bg-card"
                }`}
              >
                <p className="text-title mb-1">{plan.name}</p>
                <p className="text-sm text-muted-foreground mb-6">{plan.tagline}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-display font-semibold">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>

                <p className="text-sm font-medium mb-6">{plan.usageLabel}</p>

                <ul className="space-y-3 text-sm mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {!loading && isCurrent ? (
                    <div className="flex flex-col gap-3">
                      <button
                        disabled
                        className="w-full rounded-full py-3 font-semibold text-sm border border-border text-muted-foreground disabled:opacity-60"
                      >
                        Current plan
                      </button>
                      {isPaidPlan(plan.id) && (
                        <button
                          onClick={handleManage}
                          disabled={billingUrl === "opening"}
                          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                        >
                          {billingUrl === "opening" ? "Opening..." : "Manage subscription"}
                        </button>
                      )}
                    </div>
                  ) : plan.id === "free" ? (
                    <Link
                      href="/signup"
                      className="block w-full rounded-full py-3 font-semibold text-sm text-center border border-border hover:border-white/25 transition-colors"
                    >
                      Get started
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        if (!user) {
                          router.push("/login");
                          return;
                        }
                        handleCheckout(plan.id as "premium" | "super_premium");
                      }}
                      disabled={checkingOut === plan.id}
                      className={`w-full rounded-full py-3 font-semibold text-sm transition-colors disabled:opacity-40 ${
                        plan.highlighted ? "" : "border border-border hover:border-white/25"
                      }`}
                      style={
                        plan.highlighted
                          ? { background: "#ffffff", color: "#000000" }
                          : undefined
                      }
                    >
                      {user
                        ? `Upgrade to ${plan.name}`
                        : "Log in to upgrade"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Questions? Contact support at{" "}
          <span className="text-foreground">support@clipper.app</span>
        </p>
      </div>
    </main>
  );
}