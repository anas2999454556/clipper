import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="text-center animate-fade-in">
        <h1 className="text-display mb-3">404</h1>
        <p className="text-muted-foreground text-sm mb-8">
          This page does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold"
          style={{ background: "#ffffff", color: "#000000" }}
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}