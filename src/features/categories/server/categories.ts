import "server-only";

import { requireUserId } from "@/lib/auth";
import type { Category, SubCategory } from "@/types/database.generated";

const DEFAULT_CATEGORIES = ["衣", "食", "住", "趣", "仕"] as const;

export type CategoryWithSubs = Category & { subCategories: SubCategory[] };

export async function getCategories(): Promise<CategoryWithSubs[]> {
  const { supabase, userId } = await requireUserId();
  const { data: initialCategories, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order")
    .order("name");

  if (error) throw new Error("カテゴリを読み込めませんでした。");
  let categories = initialCategories;

  if (categories.length === 0) {
    await supabase.from("categories").insert(
      DEFAULT_CATEGORIES.map((name, sortOrder) => ({
        user_id: userId,
        name,
        sort_order: sortOrder,
      })),
    );
    const retry = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order")
      .order("name");
    if (retry.error) throw new Error("カテゴリを準備できませんでした。");
    categories = retry.data;
  }

  const { data: subCategories, error: subError } = await supabase
    .from("sub_categories")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order")
    .order("name");
  if (subError) throw new Error("サブカテゴリを読み込めませんでした。");

  const byCategory = new Map<string, SubCategory[]>();
  subCategories.forEach((subCategory) => {
    const list = byCategory.get(subCategory.category_id) ?? [];
    list.push(subCategory);
    byCategory.set(subCategory.category_id, list);
  });

  return categories.map((category) => ({
    ...category,
    subCategories: byCategory.get(category.id) ?? [],
  }));
}
