"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { itemSchema } from "@/features/items/schemas/item-schema";
import {
  failedAction,
  invalidAction,
  type ActionState,
} from "@/lib/action-state";
import { requireUserId } from "@/lib/auth";
import type { ItemStatus } from "@/types/database.generated";

export async function saveItemAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = itemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalidAction(parsed.error.flatten().fieldErrors);
  const { supabase, userId } = await requireUserId();
  const value = parsed.data;
  const record = {
    name: value.name,
    category_id: value.categoryId,
    sub_category_id: value.subCategoryId ?? null,
    quantity: value.quantity,
    color: value.color ?? null,
    size: value.size ?? null,
    purpose: value.purpose ?? null,
    product_url: value.productUrl ?? null,
    purchase_price: value.purchasePrice ?? null,
    purchased_at: value.purchasedAt ?? null,
    last_used_at: value.lastUsedAt ?? null,
    status: value.status,
    review_requested: value.reviewRequested,
    memo: value.memo ?? null,
  };
  const query = value.itemId
    ? supabase
        .from("items")
        .update(record)
        .eq("id", value.itemId)
        .eq("user_id", userId)
        .is("archived_at", null)
        .select("id")
        .single()
    : supabase
        .from("items")
        .insert({ ...record, user_id: userId })
        .select("id")
        .single();
  const { data, error } = await query;
  if (error || !data)
    return failedAction(
      "Itemを保存できませんでした。カテゴリの組み合わせも確認してください。",
    );
  revalidatePath("/items");
  revalidatePath("/dashboard");
  redirect(`/items/${data.id}`);
}

const idSchema = z.object({ itemId: z.string().uuid() });

export async function archiveItemAction(formData: FormData) {
  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { supabase, userId } = await requireUserId();
  const reason =
    String(formData.get("releaseReason") ?? "")
      .trim()
      .slice(0, 255) || null;
  const { error } = await supabase
    .from("items")
    .update({ archived_at: new Date().toISOString(), release_reason: reason })
    .eq("id", parsed.data.itemId)
    .eq("user_id", userId)
    .is("archived_at", null);
  if (error) throw new Error("Archiveできませんでした。");
  revalidatePath("/items");
  revalidatePath("/archive");
  revalidatePath("/dashboard");
  redirect("/archive");
}

export async function requestReviewAction(formData: FormData) {
  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase
    .from("items")
    .update({ review_requested: true })
    .eq("id", parsed.data.itemId)
    .eq("user_id", userId)
    .is("archived_at", null);
  if (error) throw new Error("Reviewへ追加できませんでした。");
  revalidatePath("/review");
  revalidatePath(`/items/${parsed.data.itemId}`);
}

export async function updateItemStatusAction(formData: FormData) {
  const parsed = idSchema
    .extend({ status: z.enum(["KEEP", "MAYBE", "RELEASE"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase
    .from("items")
    .update({ status: parsed.data.status as ItemStatus })
    .eq("id", parsed.data.itemId)
    .eq("user_id", userId)
    .is("archived_at", null);
  if (error) throw new Error("Statusを更新できませんでした。");
  revalidatePath("/items");
  revalidatePath(`/items/${parsed.data.itemId}`);
  revalidatePath("/dashboard");
}
