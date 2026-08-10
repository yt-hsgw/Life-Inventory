"use server";

import { revalidatePath } from "next/cache";
import { idealSchema } from "@/features/ideal/schemas/ideal-schema";
import {
  failedAction,
  invalidAction,
  type ActionState,
} from "@/lib/action-state";
import { requireUserId } from "@/lib/auth";
import { z } from "zod";

export async function saveIdealAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = idealSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalidAction(parsed.error.flatten().fieldErrors);
  const { supabase, userId } = await requireUserId();
  const value = parsed.data;
  const record = {
    name: value.name,
    category_id: value.categoryId,
    sub_category_id: value.subCategoryId ?? null,
    target_quantity: value.targetQuantity,
    estimated_price: value.estimatedPrice ?? null,
    priority: value.priority ?? null,
    memo: value.memo || null,
  };
  const query = value.idealItemId
    ? supabase
        .from("ideal_items")
        .update(record)
        .eq("id", value.idealItemId)
        .eq("user_id", userId)
    : supabase.from("ideal_items").insert({ ...record, user_id: userId });
  const { error } = await query;
  if (error) return failedAction("Idealを保存できませんでした。");
  revalidatePath("/ideal");
  revalidatePath("/dashboard");
  return { status: "idle" };
}

export async function deleteIdealAction(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("idealItemId"));
  if (!id.success) return;
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase
    .from("ideal_items")
    .delete()
    .eq("id", id.data)
    .eq("user_id", userId);
  if (error) throw new Error("Idealを削除できませんでした。");
  revalidatePath("/ideal");
  revalidatePath("/dashboard");
}
