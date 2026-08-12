import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/layout/app-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("@/features/auth/actions", () => ({ signOutAction: vi.fn() }));

describe("AppShell", () => {
  it("keeps navigation accessible while toggling the sidebar", () => {
    const { container } = render(
      <AppShell>
        <p>本文</p>
      </AppShell>,
    );
    const shell = container.firstElementChild;
    const separator = screen.getByRole("separator", {
      name: "サイドバーの幅を変更",
    });
    const desktopNavigation = within(
      screen.getByRole("navigation", { name: "メインナビゲーション" }),
    );

    expect(shell).toHaveStyle({ "--sidebar-width": "240px" });
    expect(
      desktopNavigation.getByRole("link", { name: "インベントリ" }),
    ).toHaveAttribute("aria-current", "page");

    fireEvent.keyDown(separator, { key: "Home" });
    expect(shell).toHaveStyle({ "--sidebar-width": "76px" });
    expect(desktopNavigation.getByRole("link", { name: "持ち物" })).toBeVisible();
    expect(screen.getByRole("button", { name: "ログアウト" })).toHaveClass(
      "text-destructive",
    );

    fireEvent.keyDown(separator, { key: "Enter" });
    expect(shell).toHaveStyle({ "--sidebar-width": "240px" });
  });
});
