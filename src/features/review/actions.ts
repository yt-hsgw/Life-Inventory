"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";

const reviewSchema = z.object({
  itemId: z.string().uuid(),
  decision: z.enum(["KEEP", "MAYBE", "RELEASE"]),
  memo: z.string().trim().max(1000).optional(),
});

export async function reviewItemAction(formData: FormData) {
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Review入力が正しくありません。");
  const { supabase } = await requireUserId();
  const { error } = await supabase.rpc("review_item", {
    p_item_id: parsed.data.itemId,
    p_decision: parsed.data.decision,
    p_memo: parsed.data.memo || null,
  });
  if (error) throw new Error("Reviewを保存できませんでした。");
  revalidatePath("/review");
  revalidatePath("/items");
  revalidatePath("/dashboard");
  redirect(`/review?last=${parsed.data.decision}`);
}
