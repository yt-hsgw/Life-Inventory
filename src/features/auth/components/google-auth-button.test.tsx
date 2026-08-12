import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";

const { signInWithOAuth } = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signInWithOAuth } }),
}));

describe("GoogleAuthButton", () => {
  beforeEach(() => {
    signInWithOAuth.mockReset();
    signInWithOAuth.mockResolvedValue({ error: null });
  });

  it("starts Google OAuth with the same-origin callback", async () => {
    render(<GoogleAuthButton />);

    fireEvent.click(screen.getByRole("button", { name: "Googleで続ける" }));

    await waitFor(() =>
      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=%2Fdashboard`,
        },
      }),
    );
  });

  it("shows a generic error when OAuth cannot start", async () => {
    signInWithOAuth.mockResolvedValue({ error: new Error("provider detail") });
    render(<GoogleAuthButton />);

    fireEvent.click(screen.getByRole("button", { name: "Googleで続ける" }));

    expect(
      await screen.findByText(
        "Googleログインを開始できませんでした。時間をおいてもう一度お試しください。",
      ),
    ).toBeVisible();
    expect(screen.queryByText("provider detail")).not.toBeInTheDocument();
  });
});
