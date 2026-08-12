import { describe, expect, it } from "vitest";
import {
  calculateGap,
  getGapDirection,
} from "@/features/ideal/domain/calculate-gap";

describe("ideal gap", () => {
  it("uses target minus current", () => {
    expect(calculateGap(7, 5)).toBe(-2);
    expect(calculateGap(0, 1)).toBe(1);
  });

  it("classifies the next action without commanding the user", () => {
    expect(getGapDirection(-1)).toBe("REDUCE");
    expect(getGapDirection(1)).toBe("ADD");
    expect(getGapDirection(0)).toBe("MATCHED");
  });
});
