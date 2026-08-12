import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavigationPendingHint } from "@/components/navigation/navigation-pending-hint";

vi.mock("next/link", () => ({ useLinkStatus: () => ({ pending: true }) }));

describe("NavigationPendingHint", () => {
  it("announces an in-progress navigation without shifting layout", () => {
    render(<NavigationPendingHint />);

    expect(screen.getByText("移動中")).toHaveClass("sr-only");
    expect(screen.getByTestId("navigation-pending-hint")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
