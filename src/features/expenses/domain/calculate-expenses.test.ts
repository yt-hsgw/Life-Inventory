import { describe, expect, it } from "vitest";
import {
  annualEquivalent,
  calculateExpenseTotals,
  monthlyEquivalent,
} from "@/features/expenses/domain/calculate-expenses";

describe("expense normalization", () => {
  it("converts yearly billing to a monthly equivalent", () => {
    expect(monthlyEquivalent(5900, "YEARLY")).toBeCloseTo(491.67, 2);
    expect(monthlyEquivalent(80000, "MONTHLY")).toBe(80000);
  });

  it("keeps annual totals exact before display rounding", () => {
    expect(annualEquivalent(5900, "YEARLY")).toBe(5900);
    expect(
      calculateExpenseTotals([
        { amount: 1000, billing_cycle: "MONTHLY" },
        { amount: 6000, billing_cycle: "YEARLY" },
      ]),
    ).toEqual({ monthly: 1500, annual: 18000 });
  });
});
