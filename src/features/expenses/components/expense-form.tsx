"use client";

import { useActionState } from "react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { saveExpenseAction } from "@/features/expenses/actions";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
} from "@/features/expenses/types";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import type { ExpenseRow } from "@/types/database.generated";

export function ExpenseForm({ expense }: { expense?: ExpenseRow }) {
  const [state, action] = useActionState(
    saveExpenseAction,
    INITIAL_ACTION_STATE,
  );
  const suffix = expense?.id ?? "new";
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      {expense ? (
        <input type="hidden" name="expenseId" value={expense.id} />
      ) : null}
      <div className="sm:col-span-2">
        <FormField
          label="名前"
          htmlFor={`expense-name-${suffix}`}
          error={state.errors?.name?.[0]}
        >
          <Input
            id={`expense-name-${suffix}`}
            name="name"
            defaultValue={expense?.name}
            maxLength={100}
            required
          />
        </FormField>
      </div>
      <FormField label="カテゴリ" htmlFor={`expense-category-${suffix}`}>
        <select
          id={`expense-category-${suffix}`}
          name="category"
          defaultValue={expense?.category ?? "HOUSING"}
        >
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {EXPENSE_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </FormField>
      <FormField
        label="金額"
        htmlFor={`expense-amount-${suffix}`}
        error={state.errors?.amount?.[0]}
      >
        <Input
          id={`expense-amount-${suffix}`}
          name="amount"
          type="number"
          min="0"
          defaultValue={expense?.amount ?? ""}
          required
        />
      </FormField>
      <FormField label="支払い周期" htmlFor={`expense-cycle-${suffix}`}>
        <select
          id={`expense-cycle-${suffix}`}
          name="billingCycle"
          defaultValue={expense?.billing_cycle ?? "MONTHLY"}
        >
          <option value="MONTHLY">毎月</option>
          <option value="YEARLY">毎年</option>
        </select>
      </FormField>
      <FormField
        label="支払い月"
        htmlFor={`expense-month-${suffix}`}
        hint="「毎年」を選んだ場合のみ"
      >
        <Input
          id={`expense-month-${suffix}`}
          name="billingMonth"
          type="number"
          min="1"
          max="12"
          defaultValue={expense?.billing_month ?? ""}
        />
      </FormField>
      <div className="sm:col-span-2">
        <FormField label="メモ" htmlFor={`expense-memo-${suffix}`}>
          <Textarea
            id={`expense-memo-${suffix}`}
            name="memo"
            defaultValue={expense?.memo ?? ""}
          />
        </FormField>
      </div>
      {state.message ? (
        <p className="text-destructive text-sm sm:col-span-2" role="alert">
          {state.message}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <SubmitButton pendingLabel="固定費を保存中…">
          {expense ? "固定費を更新" : "固定費を追加"}
        </SubmitButton>
      </div>
    </form>
  );
}
