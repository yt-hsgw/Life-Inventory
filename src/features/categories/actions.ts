"use server";

import { revalidatePath } from "next/cache";
import {
  failedAction,
  invalidAction,
  type ActionState,
} from "@/lib/action-state";
import { requireUserId } from "@/lib/auth";
import {
  categorySchema,
  subCategorySchema,
} from "@/features/categories/schemas/category-schema";

export async function saveCategoryAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalidAction(parsed.error.flatten().fieldErrors);
  const { supabase, userId } = await requireUserId();
  const values = { name: parsed.data.name, sort_order: parsed.data.sortOrder };
  const query = parsed.data.id
    ? supabase
        .from("categories")
        .update(values)
        .eq("id", parsed.data.id)
        .eq("user_id", userId)
    : supabase.from("categories").insert({ ...values, user_id: userId });
  const { error } = await query;
  if (error)
    return failedAction("同じ名前のカテゴリがあるか、保存できない状態です。");
  revalidatePath("/settings/categories");
  revalidatePath("/items");
  return { status: "idle" };
}

export async function saveSubCategoryAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = subCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalidAction(parsed.error.flatten().fieldErrors);
  const { supabase, userId } = await requireUserId();
  const values = {
    category_id: parsed.data.categoryId,
    name: parsed.data.name,
    sort_order: parsed.data.sortOrder,
  };
  const query = parsed.data.id
    ? supabase
        .from("sub_categories")
        .update(values)
        .eq("id", parsed.data.id)
        .eq("user_id", userId)
    : supabase.from("sub_categories").insert({ ...values, user_id: userId });
  const { error } = await query;
  if (error) return failedAction("サブカテゴリを保存できませんでした。");
  revalidatePath("/settings/categories");
  revalidatePath("/items");
  return { status: "idle" };
}
