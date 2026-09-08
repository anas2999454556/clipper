import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Clipper",
  description: "Clipper's privacy policy and data processing practices.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 px-6 py-16 md:px-10">
      <article className="max-w-2xl mx-auto prose-dark">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
          &larr; Back to home
        </Link>

        <h1 className="text-headline mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: September 6, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-title mb-3">1. Who we are</h2>
            <p className="text-muted-foreground">
              Clipper (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a video clipping tool operated by Anas Ali.
              For any privacy-related questions, contact us at{" "}
              <a href="mailto:privacy@clipper.app" className="text-foreground underline">privacy@clipper.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">2. What data we collect</h2>
            <p className="text-muted-foreground mb-3">We collect the following data when you use Clipper:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong className="text-foreground">Account data:</strong> email address, name, and hashed password.</li>
              <li><strong className="text-foreground">Video content:</strong> videos you upload for processing. These are stored on our servers and deleted when you delete them or your account.</li>
              <li><strong className="text-foreground">Usage data:</strong> number of videos processed and plan type.</li>
              <li><strong className="text-foreground">Payment data:</strong> processed by Stripe. We do not store credit card numbers. See{" "}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-foreground underline">Stripe&apos;s privacy policy</a>.
              </li>
              <li><strong className="text-foreground">Session data:</strong> an authentication cookie (<code>clipper_token</code>) to keep you logged in.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-title mb-3">3. How we use your data</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>To provide and maintain the Clipper service.</li>
              <li>To process your video uploads and generate clips.</li>
              <li>To manage your subscription and payments.</li>
              <li>To send service-related communications (e.g. account confirmation).</li>
              <li>To prevent abuse and enforce rate limits.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-title mb-3">4. Third-party services</h2>
            <p className="text-muted-foreground mb-3">We use the following third-party services that may process data on your behalf:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong className="text-foreground">Stripe</strong> &mdash; payment processing.</li>
              <li><strong className="text-foreground">Google Identity Services</strong> &mdash; optional sign-in. Only loaded if you consent to cookies.</li>
              <li><strong className="text-foreground">Cloudflare</strong> &mdash; hosting and CDN.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-title mb-3">5. Data retention</h2>
            <p className="text-muted-foreground">
              We retain your account data for as long as your account is active. Videos are stored until you delete them.
              You can delete your account at any time from your account settings, which will remove all your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">6. Your rights</h2>
            <p className="text-muted-foreground mb-3">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Export your data in a portable format.</li>
              <li>Object to or restrict certain processing.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:privacy@clipper.app" className="text-foreground underline">privacy@clipper.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">7. Security</h2>
            <p className="text-muted-foreground">
              We use industry-standard security measures including encrypted passwords (bcrypt), HTTP-only secure cookies,
              and HTTPS in production. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">8. Changes to this policy</h2>
            <p className="text-muted-foreground">
              We may update this policy from time to time. We will notify you of significant changes by email or
              by posting a notice on our site.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">9. Contact</h2>
            <p className="text-muted-foreground">
              For privacy inquiries, contact{" "}
              <a href="mailto:privacy@clipper.app" className="text-foreground underline">privacy@clipper.app</a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}