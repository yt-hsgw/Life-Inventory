import "server-only";

import { calculateExpenseTotals } from "@/features/expenses/domain/calculate-expenses";
import { requireUserId } from "@/lib/auth";

export async function getExpenses() {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("category")
    .order("name");
  if (error) throw new Error("固定費を読み込めませんでした。");
  return { expenses: data, totals: calculateExpenseTotals(data) };
}
