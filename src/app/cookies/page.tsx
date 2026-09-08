import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - Clipper",
  description: "Clipper's cookie policy and the cookies we use.",
};

export default function CookiePolicyPage() {
  return (
    <main className="flex-1 px-6 py-16 md:px-10">
      <article className="max-w-2xl mx-auto prose-dark">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
          &larr; Back to home
        </Link>

        <h1 className="text-headline mb-6">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: September 6, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-title mb-3">1. What are cookies</h2>
            <p className="text-muted-foreground">
              Cookies are small text files placed on your device when you visit a website. They help us provide
              essential functionality and improve your experience.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">2. Cookies we use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-muted-foreground border border-border mt-3">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-foreground font-medium">Cookie</th>
                    <th className="p-3 text-foreground font-medium">Purpose</th>
                    <th className="p-3 text-foreground font-medium">Duration</th>
                    <th className="p-3 text-foreground font-medium">Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3"><code>clipper_token</code></td>
                    <td className="p-3">Keeps you logged in. Used for authentication.</td>
                    <td className="p-3">7 days</td>
                    <td className="p-3">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-title mb-3">3. Third-party cookies</h2>
            <p className="text-muted-foreground">
              If you choose to sign in with Google, Google Identity Services sets its own cookies (e.g.{" "}
              <code>__Secure-1PSID</code>, <code>NID</code>) via an iframe from{" "}
              <code>accounts.google.com</code>. These are Google&apos;s cookies, not ours. Google&apos;s cookie
              policy applies:{" "}
              <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-foreground underline">
                Google Cookie Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-title mb-3">4. Managing cookies</h2>
            <p className="text-muted-foreground mb-3">
              You can control cookies through your browser settings. Disabling <code>clipper_token</code> will
              prevent you from logging in.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-foreground underline">Chrome</a></li>
              <li><a href="https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-foreground underline">Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-foreground underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-foreground underline">Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-title mb-3">5. Contact</h2>
            <p className="text-muted-foreground">
              Questions about our cookie use? Contact{" "}
              <a href="mailto:privacy@clipper.app" className="text-foreground underline">privacy@clipper.app</a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}