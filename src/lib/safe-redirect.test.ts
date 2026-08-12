import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

const REQUEST_URL = "https://inventory.example/auth/confirm";

describe("getSafeRedirectPath", () => {
  it("keeps same-origin paths and their query strings", () => {
    expect(getSafeRedirectPath("/items?status=MAYBE", REQUEST_URL)).toBe(
      "/items?status=MAYBE",
    );
  });

  it.each([
    "https://evil.example/",
    "//evil.example/",
    "/\\evil.example/",
    "\\evil.example/",
  ])("falls back for unsafe destination %s", (destination) => {
    expect(getSafeRedirectPath(destination, REQUEST_URL)).toBe("/dashboard");
  });
});
