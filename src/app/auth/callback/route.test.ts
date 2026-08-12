import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/auth/callback/route";

const { exchangeCodeForSession } = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession } }),
}));

describe("Google OAuth callback", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
    exchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it("exchanges the code and redirects to a safe application path", async () => {
    const response = await GET(
      new Request(
        "https://inventory.example/auth/callback?code=oauth-code&next=%2Fitems%3Fstatus%3DMAYBE",
      ),
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith("oauth-code");
    expect(response.headers.get("location")).toBe(
      "https://inventory.example/items?status=MAYBE",
    );
  });

  it("rejects an external redirect destination", async () => {
    const response = await GET(
      new Request(
        "https://inventory.example/auth/callback?code=oauth-code&next=https%3A%2F%2Fevil.example",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://inventory.example/dashboard",
    );
  });

  it("returns to login without exposing provider details when exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("secret") });

    const response = await GET(
      new Request("https://inventory.example/auth/callback?code=oauth-code"),
    );

    expect(response.headers.get("location")).toBe(
      "https://inventory.example/login?error=oauth",
    );
  });
});
