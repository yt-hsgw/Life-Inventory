"use client";

import {
  Archive,
  CircleGauge,
  CreditCard,
  ChevronsLeftRight,
  ListChecks,
  LogOut,
  Package,
  Settings,
  Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { signOutAction } from "@/features/auth/actions";
import { NavigationPendingHint } from "@/components/navigation/navigation-pending-hint";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "インベントリ", icon: CircleGauge },
  { href: "/items", label: "持ち物", icon: Package },
  { href: "/review", label: "見直し", icon: ListChecks },
  { href: "/ideal", label: "理想", icon: Target },
  { href: "/expenses", label: "固定費", icon: CreditCard },
] as const;

const COLLAPSED_SIDEBAR_WIDTH = 76;
const DEFAULT_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 360;
const LABEL_VISIBILITY_WIDTH = 176;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const dragStart = useRef<{ pointerX: number; width: number } | null>(null);
  const expandedWidth = useRef(DEFAULT_SIDEBAR_WIDTH);
  const showLabels = sidebarWidth >= LABEL_VISIBILITY_WIDTH;
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  function updateSidebarWidth(width: number) {
    setSidebarWidth(width);
    if (width >= LABEL_VISIBILITY_WIDTH) expandedWidth.current = width;
  }

  function handleResizeStart(event: PointerEvent<HTMLButtonElement>) {
    dragStart.current = { pointerX: event.clientX, width: sidebarWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleResize(event: PointerEvent<HTMLButtonElement>) {
    if (!dragStart.current) return;
    const nextWidth = Math.min(
      MAX_SIDEBAR_WIDTH,
      Math.max(
        COLLAPSED_SIDEBAR_WIDTH,
        dragStart.current.width + event.clientX - dragStart.current.pointerX,
      ),
    );
    updateSidebarWidth(nextWidth);
  }

  function handleResizeEnd(event: PointerEvent<HTMLButtonElement>) {
    const start = dragStart.current;
    dragStart.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (!start || Math.abs(event.clientX - start.pointerX) >= 4) return;
    updateSidebarWidth(
      sidebarWidth < LABEL_VISIBILITY_WIDTH
        ? expandedWidth.current
        : COLLAPSED_SIDEBAR_WIDTH,
    );
  }

  function handleResizeKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      updateSidebarWidth(
        sidebarWidth < LABEL_VISIBILITY_WIDTH
          ? expandedWidth.current
          : COLLAPSED_SIDEBAR_WIDTH,
      );
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      updateSidebarWidth(COLLAPSED_SIDEBAR_WIDTH);
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowLeft" ? -16 : 16;
    updateSidebarWidth(
      Math.min(
        MAX_SIDEBAR_WIDTH,
        Math.max(COLLAPSED_SIDEBAR_WIDTH, sidebarWidth + delta),
      ),
    );
  }

  const shellStyle = {
    "--sidebar-width": `${sidebarWidth}px`,
  } as CSSProperties;

  const navigationLinkClass =
    "text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-primary flex min-h-11 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none";

  return (
    <div
      className="min-h-screen md:grid md:grid-cols-[var(--sidebar-width)_1fr]"
      style={shellStyle}
    >
      <aside
        className={cn(
          "border-border bg-card/90 fixed inset-y-0 left-0 z-20 hidden w-(--sidebar-width) flex-col border-r py-7 backdrop-blur md:flex",
          showLabels ? "px-5" : "px-3",
        )}
      >
        <Link
          href="/dashboard"
          aria-label="Life Inventoryのインベントリへ移動"
          title={showLabels ? undefined : "Life Inventory"}
          className="focus-visible:ring-primary flex min-h-11 items-center gap-3 overflow-hidden px-2 text-sm font-bold tracking-wide whitespace-nowrap focus-visible:ring-2 focus-visible:outline-none"
        >
          <span className="bg-secondary grid size-9 shrink-0 place-items-center rounded-xl">
            <Image src="/app-icon.svg" alt="" width={20} height={20} />
          </span>
          {showLabels ? <span>LIFE INVENTORY</span> : null}
          <NavigationPendingHint />
        </Link>
        <nav className="mt-10 space-y-1" aria-label="メインナビゲーション">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={showLabels ? undefined : item.label}
              aria-label={item.label}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                navigationLinkClass,
                isActive(item.href) && "bg-secondary text-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {showLabels ? (
                <span className="whitespace-nowrap">{item.label}</span>
              ) : null}
              <NavigationPendingHint />
            </Link>
          ))}
        </nav>
        <div className="border-border mt-auto space-y-1 border-t pt-5">
          <Link
            href="/archive"
            title={showLabels ? undefined : "アーカイブ"}
            aria-label="アーカイブ"
            aria-current={isActive("/archive") ? "page" : undefined}
            className={cn(
              navigationLinkClass,
              isActive("/archive") && "bg-secondary text-foreground",
            )}
          >
            <Archive className="size-4 shrink-0" />
            {showLabels ? (
              <span className="whitespace-nowrap">アーカイブ</span>
            ) : null}
            <NavigationPendingHint />
          </Link>
          <Link
            href="/settings/categories"
            title={showLabels ? undefined : "設定"}
            aria-label="設定"
            aria-current={isActive("/settings") ? "page" : undefined}
            className={cn(
              navigationLinkClass,
              isActive("/settings") && "bg-secondary text-foreground",
            )}
          >
            <Settings className="size-4 shrink-0" />
            {showLabels ? (
              <span className="whitespace-nowrap">設定</span>
            ) : null}
            <NavigationPendingHint />
          </Link>
          <form action={signOutAction}>
            <SubmitButton
              variant="ghost"
              pendingLabel="ログアウト中…"
              title={showLabels ? undefined : "ログアウト"}
              className="text-destructive hover:bg-destructive/10 focus-visible:ring-destructive flex min-h-11 w-full items-center gap-3 overflow-hidden rounded-xl px-3 text-left text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
            >
              <LogOut className="size-4 shrink-0" />
              {showLabels ? (
                <span className="whitespace-nowrap">ログアウト</span>
              ) : (
                <span className="sr-only">ログアウト</span>
              )}
            </SubmitButton>
          </form>
        </div>
        <button
          type="button"
          role="separator"
          aria-orientation="vertical"
          aria-label="サイドバーの幅を変更"
          aria-valuemin={COLLAPSED_SIDEBAR_WIDTH}
          aria-valuemax={MAX_SIDEBAR_WIDTH}
          aria-valuenow={Math.round(sidebarWidth)}
          aria-valuetext={
            showLabels ? `${Math.round(sidebarWidth)}ピクセル` : "折りたたみ"
          }
          title="ドラッグで幅を変更・クリックで折りたたみ"
          className="group focus-visible:ring-primary absolute inset-y-0 -right-2 hidden w-4 cursor-col-resize touch-none focus-visible:ring-2 focus-visible:outline-none md:block"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResize}
          onPointerUp={handleResizeEnd}
          onPointerCancel={() => {
            dragStart.current = null;
          }}
          onLostPointerCapture={() => {
            dragStart.current = null;
          }}
          onKeyDown={handleResizeKeyDown}
        >
          <span className="bg-border group-hover:bg-primary group-focus-visible:bg-primary absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors" />
          <span className="border-border bg-card text-muted-foreground group-hover:border-primary group-hover:text-primary absolute top-1/2 left-1/2 grid h-10 w-3 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[9px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <ChevronsLeftRight className="size-2.5" />
          </span>
        </button>
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
              "text-muted-foreground focus-visible:ring-primary relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold focus-visible:ring-2 focus-visible:outline-none",
              isActive(item.href) && "bg-secondary text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
            <NavigationPendingHint className="absolute top-1.5 right-1.5" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
