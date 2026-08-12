import { describe, expect, it } from "vitest";
import {
  countItemQuantity,
  isReviewTarget,
} from "@/features/items/domain/item-metrics";

describe("item metrics", () => {
  it("counts active quantities instead of rows", () => {
    expect(
      countItemQuantity([
        { quantity: 3, archived_at: null },
        { quantity: 2, archived_at: "2026-01-01" },
      ]),
    ).toBe(3);
  });

  it("marks MAYBE and requested active items for review", () => {
    expect(
      isReviewTarget({
        status: "MAYBE",
        review_requested: false,
        archived_at: null,
      }),
    ).toBe(true);
    expect(
      isReviewTarget({
        status: "KEEP",
        review_requested: true,
        archived_at: null,
      }),
    ).toBe(true);
    expect(
      isReviewTarget({
        status: "MAYBE",
        review_requested: true,
        archived_at: "2026-01-01",
      }),
    ).toBe(false);
  });
});
