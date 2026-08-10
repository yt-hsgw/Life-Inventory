"use client";

import {
  Archive,
  CircleGauge,
  CreditCard,
  Leaf,
  ListChecks,
  Package,
  Settings,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: CircleGauge },
  { href: "/items", label: "Items", icon: Package },
  { href: "/review", label: "Review", icon: ListChecks },
  { href: "/ideal", label: "Ideal", icon: Target },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-border bg-card/90 fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r px-5 py-7 backdrop-blur md:flex">
        <Link
          href="/dashboard"
          className="focus-visible:ring-primary flex items-center gap-3 px-3 text-sm font-bold tracking-wide focus-visible:ring-2 focus-visible:outline-none"
        >
          <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-full">
            <Leaf className="size-4" />
          </span>
          LIFE INVENTORY
        </Link>
        <nav className="mt-10 space-y-1" aria-label="メインナビゲーション">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-primary flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                isActive(item.href) && "bg-secondary text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-border mt-auto space-y-1 border-t pt-5">
          <Link
            href="/archive"
            className={cn(
              "text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-primary flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none",
              isActive("/archive") && "bg-secondary text-foreground",
            )}
          >
            <Archive className="size-4" />
            Archive
          </Link>
          <Link
            href="/settings/categories"
            className={cn(
              "text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-primary flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none",
              isActive("/settings") && "bg-secondary text-foreground",
            )}
          >
            <Settings className="size-4" />
            Settings
          </Link>
          <form action={signOutAction}>
            <button className="text-muted-foreground hover:bg-secondary focus-visible:ring-primary min-h-10 w-full rounded-xl px-3 text-left text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none">
              ログアウト
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-5 pt-7 pb-28 md:col-start-2 md:px-10 md:pt-10 md:pb-12 xl:px-14">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <nav
        className="border-border bg-card/95 fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-2xl border p-1.5 shadow-lg backdrop-blur md:hidden"
        aria-label="モバイルナビゲーション"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={cn(
              "text-muted-foreground focus-visible:ring-primary flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold focus-visible:ring-2 focus-visible:outline-none",
              isActive(item.href) && "bg-secondary text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
