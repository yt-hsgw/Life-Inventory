import type { BillingCycle } from "@/types/database.generated";

export function monthlyEquivalent(amount: number, billingCycle: BillingCycle) {
  return billingCycle === "MONTHLY" ? amount : amount / 12;
}

export function annualEquivalent(amount: number, billingCycle: BillingCycle) {
  return billingCycle === "MONTHLY" ? amount * 12 : amount;
}

export function calculateExpenseTotals(
  expenses: { amount: number; billing_cycle: BillingCycle }[],
) {
  return expenses.reduce(
    (totals, expense) => ({
      monthly:
        totals.monthly +
        monthlyEquivalent(expense.amount, expense.billing_cycle),
      annual:
        totals.annual + annualEquivalent(expense.amount, expense.billing_cycle),
    }),
    { monthly: 0, annual: 0 },
  );
}
