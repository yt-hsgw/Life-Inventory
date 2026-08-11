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
  HOUSING: "住居費",
  UTILITIES: "水道光熱費",
  COMMUNICATION: "通信費",
  SUBSCRIPTION: "サブスクリプション",
  DEBT: "返済",
  OTHER: "その他",
};
