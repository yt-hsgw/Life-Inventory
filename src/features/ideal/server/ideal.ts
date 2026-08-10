import "server-only";

import { getCategories } from "@/features/categories/server/categories";
import {
  calculateGap,
  getGapDirection,
  type GapDirection,
} from "@/features/ideal/domain/calculate-gap";
import { requireUserId } from "@/lib/auth";
import type { IdealItemRow } from "@/types/database.generated";

export type IdealComparison = IdealItemRow & {
  categoryName: string;
  currentQuantity: number;
  gap: number;
  direction: GapDirection;
};

export async function getIdealComparisons(filter = "ALL") {
  const [{ supabase, userId }, categories] = await Promise.all([
    requireUserId(),
    getCategories(),
  ]);
  const [idealResult, itemResult] = await Promise.all([
    supabase
      .from("ideal_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("items")
      .select("name,quantity,category_id")
      .eq("user_id", userId)
      .is("archived_at", null),
  ]);
  if (idealResult.error || itemResult.error)
    throw new Error("Idealを読み込めませんでした。");
  const current = new Map<string, number>();
  itemResult.data.forEach((item) => {
    const key = `${item.category_id}:${item.name.trim().toLocaleLowerCase("ja")}`;
    current.set(key, (current.get(key) ?? 0) + item.quantity);
  });
  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name]),
  );
  const comparisons = idealResult.data.map((ideal) => {
    const currentQuantity =
      current.get(
        `${ideal.category_id}:${ideal.name.trim().toLocaleLowerCase("ja")}`,
      ) ?? 0;
    const gap = calculateGap(currentQuantity, ideal.target_quantity);
    return {
      ...ideal,
      categoryName: categoryMap.get(ideal.category_id) ?? "—",
      currentQuantity,
      gap,
      direction: getGapDirection(gap),
    };
  });
  return {
    allComparisons: comparisons,
    comparisons:
      filter === "ALL"
        ? comparisons
        : comparisons.filter((item) => item.direction === filter),
    categories,
    filter,
  };
}
