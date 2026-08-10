"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  failedAction,
  invalidAction,
  type ActionState,
} from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z.email("メールアドレスを確認してください。").max(254),
  password: z.string().min(8, "パスワードは8文字以上です。").max(128),
});

export async function signInAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = authSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalidAction(parsed.error.flatten().fieldErrors);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error)
    return failedAction("メールアドレスまたはパスワードを確認してください。");

  redirect("/dashboard");
}

export async function signUpAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = authSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalidAction(parsed.error.flatten().fieldErrors);

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);
  if (error)
    return failedAction(
      "アカウントを作成できませんでした。入力を確認してください。",
    );

  return {
    status: "error",
    message: "確認メールを送りました。メール内のリンクから続けてください。",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
