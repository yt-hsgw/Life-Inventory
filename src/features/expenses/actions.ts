"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { expenseSchema } from "@/features/expenses/schemas/expense-schema";
import {
  failedAction,
  invalidAction,
  type ActionState,
} from "@/lib/action-state";
import { requireUserId } from "@/lib/auth";

export async function saveExpenseAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalidAction(parsed.error.flatten().fieldErrors);
  const { supabase, userId } = await requireUserId();
  const value = parsed.data;
  const record = {
    name: value.name,
    category: value.category,
    amount: value.amount,
    billing_cycle: value.billingCycle,
    billing_month:
      value.billingCycle === "YEARLY" ? (value.billingMonth ?? null) : null,
    memo: value.memo || null,
  };
  const query = value.expenseId
    ? supabase
        .from("expenses")
        .update(record)
        .eq("id", value.expenseId)
        .eq("user_id", userId)
    : supabase.from("expenses").insert({ ...record, user_id: userId });
  const { error } = await query;
  if (error) return failedAction("固定費を保存できませんでした。");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { status: "idle" };
}

export async function deleteExpenseAction(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("expenseId"));
  if (!id.success) return;
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id.data)
    .eq("user_id", userId);
  if (error) throw new Error("固定費を削除できませんでした。");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
