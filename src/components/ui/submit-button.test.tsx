import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubmitButton } from "@/components/ui/submit-button";

const formStatus = vi.hoisted(() => ({ pending: true }));

vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  useFormStatus: () => formStatus,
}));

describe("SubmitButton", () => {
  it("locks repeated submission and explains the pending operation", () => {
    render(
      <SubmitButton pendingLabel="状態を更新しています…">
        状態を更新
      </SubmitButton>,
    );

    const button = screen.getByRole("button", {
      name: "状態を更新しています…",
    });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
