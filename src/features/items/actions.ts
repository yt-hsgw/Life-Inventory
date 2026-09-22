"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { itemSchema } from "@/features/items/schemas/item-schema";
import {
  failedAction,
  INITIAL_ACTION_STATE,
  invalidAction,
  type ActionState,
} from "@/lib/action-state";
import { requireUserId } from "@/lib/auth";
import type { ItemStatus } from "@/types/database.generated";

export async function saveItemAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = itemSchema.safeParse({
    ...Object.fromEntries(formData),
    photoDraftIds: formData.getAll("photoDraftIds").map(String),
  });
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
  let data: { id: string } | null = null;
  let error: { message: string } | null = null;

  if (value.itemId) {
    const updateResult = await supabase
      .from("items")
      .update(record)
      .eq("id", value.itemId)
      .eq("user_id", userId)
      .is("archived_at", null)
      .select("id")
      .single();
    data = updateResult.data;
    error = updateResult.error;

    if (!error && data && value.photoDraftIds.length > 0) {
      const attachResult = await supabase.rpc("attach_item_photo_drafts", {
        p_item_id: value.itemId,
        p_photo_draft_ids: value.photoDraftIds,
      });
      if (attachResult.error) {
        return failedAction(
          "持ち物の情報は保存しましたが、写真を紐づけできませんでした。写真を残したまま再度保存してください。",
        );
      }
    }
  } else if (value.photoDraftIds.length > 0) {
    const createResult = await supabase.rpc("create_item_with_photo_drafts", {
      p_name: record.name,
      p_category_id: record.category_id,
      p_quantity: record.quantity,
      p_photo_draft_ids: value.photoDraftIds,
      p_sub_category_id: record.sub_category_id,
      p_color: record.color,
      p_size: record.size,
      p_purpose: record.purpose,
      p_product_url: record.product_url,
      p_purchase_price: record.purchase_price,
      p_purchased_at: record.purchased_at,
      p_last_used_at: record.last_used_at,
      p_status: record.status,
      p_review_requested: record.review_requested,
      p_memo: record.memo,
    });
    data = createResult.data;
    error = createResult.error;
  } else {
    const insertResult = await supabase
      .from("items")
      .insert({ ...record, user_id: userId })
      .select("id")
      .single();
    data = insertResult.data;
    error = insertResult.error;
  }

  if (error || !data)
    return failedAction(
      "持ち物を保存できませんでした。カテゴリの組み合わせも確認してください。",
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
  if (error) throw new Error("アーカイブできませんでした。");
  revalidatePath("/items");
  revalidatePath("/archive");
  revalidatePath("/dashboard");
  redirect("/archive");
}

export async function setReviewRequestedAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = idSchema
    .extend({
      reviewRequested: z
        .enum(["true", "false"])
        .transform((value) => value === "true"),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failedAction("見直しの入力が正しくありません。");
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase
    .from("items")
    .update({ review_requested: parsed.data.reviewRequested })
    .eq("id", parsed.data.itemId)
    .eq("user_id", userId)
    .is("archived_at", null);
  if (error)
    return failedAction(
      parsed.data.reviewRequested
        ? "見直しへ追加できませんでした。"
        : "見直しを解除できませんでした。",
    );
  revalidatePath("/review");
  revalidatePath(`/items/${parsed.data.itemId}`);
  revalidatePath("/dashboard");
  return INITIAL_ACTION_STATE;
}

export async function updateItemStatusAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = idSchema
    .extend({ status: z.enum(["KEEP", "MAYBE", "RELEASE"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failedAction("状態の入力が正しくありません。");
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase
    .from("items")
    .update({ status: parsed.data.status as ItemStatus })
    .eq("id", parsed.data.itemId)
    .eq("user_id", userId)
    .is("archived_at", null);
  if (error) return failedAction("状態を更新できませんでした。");
  revalidatePath("/items");
  revalidatePath(`/items/${parsed.data.itemId}`);
  revalidatePath("/dashboard");
  return INITIAL_ACTION_STATE;
}
