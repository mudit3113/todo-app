"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, BarChart2, Target, LogOut, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

interface Props {
  userName?: string | null;
  userImage?: string | null;
}

const navItems = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
];

export default function Navbar({ userName, userImage }: Props) {
  const pathname = usePathname();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/sync", { method: "POST" });
      window.location.reload();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <nav
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-1">
          <span className="font-semibold text-sm mr-4" style={{ color: "var(--foreground)" }}>
            Focus
          </span>
          {/* Nav links: visible from sm up, replaced by bottom tab bar on mobile */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                  pathname === href ? "text-white" : "hover:text-white"
                )}
                style={{
                  background: pathname === href ? "var(--accent)" : "transparent",
                  color: pathname === href ? "white" : "var(--muted)",
                }}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center justify-center sm:gap-1.5 text-xs w-7 h-7 sm:w-auto sm:px-3 sm:py-1.5 rounded-md transition-colors"
            style={{ color: "var(--muted)", background: "var(--surface-2)" }}
            title="Sync with Google Tasks"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync"}</span>
          </button>

          <div className="flex items-center gap-2">
            {userImage && (
              <img src={userImage} alt="" className="w-7 h-7 rounded-full" />
            )}
            <span className="hidden sm:inline text-sm" style={{ color: "var(--muted)" }}>
              {userName?.split(" ")[0]}
            </span>
          </div>

          <button
            onClick={() => signOut()}
            style={{ color: "var(--muted)" }}
            className="hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* Bottom tab bar: mobile only */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 py-2 px-4 flex-1 text-[11px]"
            style={{ color: pathname === href ? "var(--accent)" : "var(--muted)" }}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
