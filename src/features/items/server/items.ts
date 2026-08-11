import "server-only";

import { notFound } from "next/navigation";
import { getCategories } from "@/features/categories/server/categories";
import { itemListQuerySchema } from "@/features/items/schemas/item-schema";
import type { ItemView } from "@/features/items/types";
import { requireUserId } from "@/lib/auth";
import type { ItemRow } from "@/types/database.generated";

export function attachCategories(
  items: ItemRow[],
  categories: Awaited<ReturnType<typeof getCategories>>,
): ItemView[] {
  const categoryMap = new Map(
    categories.map((category) => [category.id, category]),
  );
  const subMap = new Map(
    categories
      .flatMap((category) => category.subCategories)
      .map((sub) => [sub.id, sub]),
  );
  return items.flatMap((item) => {
    const category = categoryMap.get(item.category_id);
    if (!category) return [];
    const subCategory = item.sub_category_id
      ? (subMap.get(item.sub_category_id) ?? null)
      : null;
    return [
      {
        ...item,
        category: { id: category.id, name: category.name },
        subCategory: subCategory
          ? { id: subCategory.id, name: subCategory.name }
          : null,
      },
    ];
  });
}

export async function getItems(
  input: { q?: string; category?: string; status?: string } = {},
) {
  const filters = itemListQuerySchema.parse(input);
  const [{ supabase, userId }, categories] = await Promise.all([
    requireUserId(),
    getCategories(),
  ]);
  let query = supabase
    .from("items")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(500);
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.q) {
    const safe = filters.q
      .replace(/[(),.:%"'\\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (safe)
      query = query.or(
        `name.ilike.%${safe}%,memo.ilike.%${safe}%,purpose.ilike.%${safe}%`,
      );
  }
  const { data, error } = await query;
  if (error) throw new Error("持ち物を読み込めませんでした。");
  return { items: attachCategories(data, categories), categories, filters };
}

export async function getItem(itemId: string) {
  const [{ supabase, userId }, categories] = await Promise.all([
    requireUserId(),
    getCategories(),
  ]);
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw new Error("持ち物を読み込めませんでした。");
  if (!data) notFound();
  const [item] = attachCategories([data], categories);
  if (!item) notFound();
  return { item, categories };
}

export async function getArchivedItems() {
  const [{ supabase, userId }, categories] = await Promise.all([
    requireUserId(),
    getCategories(),
  ]);
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", userId)
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false })
    .limit(500);
  if (error) throw new Error("アーカイブを読み込めませんでした。");
  return attachCategories(data, categories);
}
