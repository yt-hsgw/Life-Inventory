import type { ExpenseCategory } from "@/types/database.generated";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "HOUSING",
  "UTILITIES",
  "COMMUNICATION",
  "SUBSCRIPTION",
  "DEBT",
  "OTHER",
];
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  HOUSING: "Housing",
  UTILITIES: "Utilities",
  COMMUNICATION: "Communication",
  SUBSCRIPTION: "Subscription",
  DEBT: "Debt",
  OTHER: "Other",
};
