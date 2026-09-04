import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import AuthNav from "@/components/AuthNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Clipper",
  description: "Turn long videos into short-form clips",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 md:px-10 shrink-0 sticky top-0 z-40 bg-background/90 backdrop-blur-md">
            <Link
              href="/"
              className="text-base font-bold tracking-tight hover:opacity-80 transition-opacity"
            >
              Clipper
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="/upload" className="hover:text-foreground transition-colors">
                Upload
              </Link>
            </nav>

            <AuthNav />
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
