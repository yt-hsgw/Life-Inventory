"use client";

import { useActionState } from "react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { signInAction, signUpAction } from "@/features/auth/actions";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const action = mode === "sign-in" ? signInAction : signUpAction;
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormField
        label="メールアドレス"
        htmlFor={`${mode}-email`}
        error={state.errors?.email?.[0]}
      >
        <Input
          id={`${mode}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-describedby={`${mode}-email-description`}
        />
      </FormField>
      <FormField
        label="パスワード"
        htmlFor={`${mode}-password`}
        error={state.errors?.password?.[0]}
        hint="8文字以上"
      >
        <Input
          id={`${mode}-password`}
          name="password"
          type="password"
          autoComplete={
            mode === "sign-in" ? "current-password" : "new-password"
          }
          minLength={8}
          maxLength={128}
          required
          aria-describedby={`${mode}-password-description`}
        />
      </FormField>
      {state.message ? (
        <p className="bg-secondary rounded-xl p-3 text-sm" role="status">
          {state.message}
        </p>
      ) : null}
      <SubmitButton>
        {mode === "sign-in" ? "ログイン" : "アカウントを作る"}
      </SubmitButton>
    </form>
  );
}
