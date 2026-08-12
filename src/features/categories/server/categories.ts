import "server-only";

import { requireUserId } from "@/lib/auth";
import type { Category, SubCategory } from "@/types/database.generated";

const DEFAULT_CATEGORIES = ["衣", "食", "住", "趣", "仕"] as const;

export type CategoryWithSubs = Category & { subCategories: SubCategory[] };
type AuthContext = Awaited<ReturnType<typeof requireUserId>>;

export async function getCategories(
  authContext?: AuthContext,
): Promise<CategoryWithSubs[]> {
  const { supabase, userId } = authContext ?? (await requireUserId());
  const [categoryResult, subCategoryResult] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order")
      .order("name"),
    supabase
      .from("sub_categories")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order")
      .order("name"),
  ]);

  if (categoryResult.error || subCategoryResult.error)
    throw new Error("カテゴリを読み込めませんでした。");
  let categories = categoryResult.data;

  if (categories.length === 0) {
    const { error: insertError } = await supabase.from("categories").insert(
      DEFAULT_CATEGORIES.map((name, sortOrder) => ({
        user_id: userId,
        name,
        sort_order: sortOrder,
      })),
    );
    if (insertError) throw new Error("カテゴリを準備できませんでした。");
    const retry = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order")
      .order("name");
    if (retry.error) throw new Error("カテゴリを準備できませんでした。");
    categories = retry.data;
  }

  const byCategory = new Map<string, SubCategory[]>();
  subCategoryResult.data.forEach((subCategory) => {
    const list = byCategory.get(subCategory.category_id) ?? [];
    list.push(subCategory);
    byCategory.set(subCategory.category_id, list);
  });

  return categories.map((category) => ({
    ...category,
    subCategories: byCategory.get(category.id) ?? [],
  }));
}
