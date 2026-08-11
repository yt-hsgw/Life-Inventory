"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { reviewSchema } from "@/features/review/schemas/review-schema";
import { requireUserId } from "@/lib/auth";

export async function reviewItemAction(formData: FormData) {
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("見直しの入力が正しくありません。");
  const { supabase } = await requireUserId();
  const { data, error } = await supabase.rpc("review_item", {
    p_item_id: parsed.data.itemId,
    p_decision: parsed.data.decision,
    p_session_id: parsed.data.sessionId,
    p_memo: parsed.data.memo || null,
  });
  if (error || !data) throw new Error("見直しを保存できませんでした。");
  revalidatePath("/review");
  revalidatePath("/items");
  revalidatePath("/dashboard");
  redirect(`/review?session=${parsed.data.sessionId}&last=${data.decision}`);
}
