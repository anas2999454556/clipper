import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions - Clipper",
  description: "Clipper's terms and conditions of service.",
};

export default function TermsPage() {
  return (
    <main className="flex-1 px-6 py-16 md:px-10">
      <article className="max-w-2xl mx-auto prose-dark">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
          &larr; Back to home
        </Link>

        <h1 className="text-headline mb-6">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: September 6, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-title mb-3">1. Acceptance of terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Clipper (&quot;the Service&quot;), you agree to be bound by these Terms &amp; Conditions.
              If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">2. Description of service</h2>
            <p className="text-muted-foreground">
              Clipper is a video clipping tool that analyses long-form videos and generates short-form clips suitable
              for platforms such as TikTok, YouTube Shorts, and Instagram Reels.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">3. Account registration</h2>
            <p className="text-muted-foreground">
              You must provide accurate and complete information when creating an account. You are responsible for
              maintaining the security of your account credentials. You must be at least 13 years old to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">4. Your content</h2>
            <p className="text-muted-foreground">
              You retain all rights to the videos you upload. By uploading content, you grant Clipper a limited,
              non-exclusive licence to process, store, and generate clips from your content solely for the purpose
              of providing the Service. We do not use your content for any other purpose.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">5. Acceptable use</h2>
            <p className="text-muted-foreground mb-3">You agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Upload content that infringes copyright or other intellectual property rights.</li>
              <li>Upload content that is illegal, harmful, or violates any applicable law.</li>
              <li>Attempt to circumvent rate limits, usage quotas, or security measures.</li>
              <li>Use the Service to build a competing product or service.</li>
              <li>Automate access to the Service without our written permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-title mb-3">6. Subscriptions and payments</h2>
            <p className="text-muted-foreground">
              Paid subscriptions are processed by Stripe. Prices are shown on the{" "}
              <Link href="/pricing" className="text-foreground underline">pricing page</Link>.
              Subscriptions renew automatically unless cancelled. You may cancel at any time through the billing portal.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">7. Intellectual property</h2>
            <p className="text-muted-foreground">
              The Service, including its design, code, and branding, is owned by Clipper. You may not copy, modify,
              or distribute any part of the Service without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">8. Limitation of liability</h2>
            <p className="text-muted-foreground">
              The Service is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
              indirect, incidental, or consequential damages arising from your use of the Service. Our total liability
              shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">9. Termination</h2>
            <p className="text-muted-foreground">
              We may suspend or terminate your account if you violate these terms. You may delete your account at any
              time. Upon deletion, your personal data will be removed in accordance with our{" "}
              <Link href="/privacy" className="text-foreground underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">10. Changes to these terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. Continued use of the Service after changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">11. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, contact{" "}
              <a href="mailto:legal@clipper.app" className="text-foreground underline">legal@clipper.app</a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}