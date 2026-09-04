"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/lib/types";

export default function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data.user) setUser(data.user);
        else setUser(null);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground hidden md:inline">
          {user.usageCount}/{user.usageLimit === -1 ? "∞" : user.usageLimit} used
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground">
          {user.plan}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
        Log in
      </Link>
      <Link
        href="/signup"
        className="font-medium rounded-full px-5 py-2 transition-colors"
        style={{ background: "#ffffff", color: "#000000" }}
      >
        Sign up
      </Link>
    </div>
  );
}
