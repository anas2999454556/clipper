import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import AuthNav from "@/components/AuthNav";
import { CookieConsentProvider } from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Clipper",
  description: "Turn long videos into short-form clips",
  icons: {
    icon: "/clipper.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CookieConsentProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <header className="h-16 grid grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10 shrink-0 sticky top-0 z-40 bg-background/90 backdrop-blur-md">
            <Link
              href="/"
              className="justify-self-start text-base font-bold tracking-tight hover:opacity-80 transition-opacity"
            >
              Clipper
            </Link>

              <nav className="hidden md:flex justify-self-center items-center gap-8 text-sm text-muted-foreground">
                <Link href="/upload" className="hover:text-foreground transition-colors">
                  Upload
                </Link>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </nav>

              <div className="justify-self-end">
                <AuthNav />
              </div>
            </header>
            <main className="flex-1">{children}</main>

            <footer className="border-t border-border py-6 px-6 md:px-10">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Clipper</span>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                    <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                    <Link href="/refund" className="hover:text-foreground transition-colors">Refund</Link>
                    <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
                  </div>
                  <span>&copy; 2026 Clipper. Operated by Anas Ali.</span>
                </div>
              </div>
            </footer>
          </div>
        </CookieConsentProvider>
      </body>
    </html>
  );
}


