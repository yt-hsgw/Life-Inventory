import "server-only";

import { getCategories } from "@/features/categories/server/categories";
import { calculateExpenseTotals } from "@/features/expenses/domain/calculate-expenses";
import { requireUserId } from "@/lib/auth";

export async function getDashboard() {
  const [{ supabase, userId }, categories] = await Promise.all([
    requireUserId(),
    getCategories(),
  ]);
  const [itemResult, idealResult, expenseResult] = await Promise.all([
    supabase
      .from("items")
      .select("quantity,status,review_requested,category_id")
      .eq("user_id", userId)
      .is("archived_at", null)
      .limit(5000),
    supabase
      .from("ideal_items")
      .select("target_quantity")
      .eq("user_id", userId)
      .limit(5000),
    supabase
      .from("expenses")
      .select("amount,billing_cycle")
      .eq("user_id", userId)
      .limit(5000),
  ]);
  if (itemResult.error || idealResult.error || expenseResult.error)
    throw new Error("Dashboardを読み込めませんでした。");
  const currentItems = itemResult.data.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const idealItems = idealResult.data.reduce(
    (sum, item) => sum + item.target_quantity,
    0,
  );
  const categoryCounts = new Map<string, number>();
  itemResult.data.forEach((item) =>
    categoryCounts.set(
      item.category_id,
      (categoryCounts.get(item.category_id) ?? 0) + item.quantity,
    ),
  );
  return {
    currentItems,
    idealItems,
    gap: idealItems - currentItems,
    reviewCount: itemResult.data.filter(
      (item) => item.status === "MAYBE" || item.review_requested,
    ).length,
    releaseCount: itemResult.data
      .filter((item) => item.status === "RELEASE")
      .reduce((sum, item) => sum + item.quantity, 0),
    expenses: calculateExpenseTotals(expenseResult.data),
    categoryCounts: categories.map((category) => ({
      id: category.id,
      name: category.name,
      quantity: categoryCounts.get(category.id) ?? 0,
    })),
  };
}
