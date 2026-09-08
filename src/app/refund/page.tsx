import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy - Clipper",
  description: "Clipper's refund and cancellation policy.",
};

export default function RefundPolicyPage() {
  return (
    <main className="flex-1 px-6 py-16 md:px-10">
      <article className="max-w-2xl mx-auto prose-dark">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
          &larr; Back to home
        </Link>

        <h1 className="text-headline mb-6">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: September 6, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-title mb-3">1. Subscription cancellations</h2>
            <p className="text-muted-foreground">
              You may cancel your subscription at any time through your billing portal, accessible from your account
              settings. Upon cancellation, your subscription will remain active until the end of the current billing
              period.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">2. Refund eligibility</h2>
            <p className="text-muted-foreground mb-3">You may request a refund if:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>You were charged due to a billing error.</li>
              <li>The Service was unavailable for a significant portion of your billing period.</li>
              <li>You requested a refund within 14 days of your initial subscription purchase.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-title mb-3">3. How to request a refund</h2>
            <p className="text-muted-foreground">
              Email{" "}
              <a href="mailto:support@clipper.app" className="text-foreground underline">support@clipper.app</a>{" "}
              with your account email and the reason for your request. We will respond within 5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">4. Free tier</h2>
            <p className="text-muted-foreground">
              The free tier provides 5 video analyses at no cost. No payment information is required for the free tier.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">5. Changes to this policy</h2>
            <p className="text-muted-foreground">
              We reserve the right to update this refund policy. Changes apply to new subscriptions made after the
              effective date.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}