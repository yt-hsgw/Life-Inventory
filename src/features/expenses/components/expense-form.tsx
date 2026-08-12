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
          hint="例：家賃、通信回線、動画サービス"
        >
          <Input
            id={`expense-name-${suffix}`}
            name="name"
            defaultValue={expense?.name}
            maxLength={100}
            required
            placeholder="例：家賃"
            aria-describedby={`expense-name-${suffix}-description`}
            aria-invalid={Boolean(state.errors?.name)}
          />
        </FormField>
      </div>
      <FormField
        label="カテゴリ"
        htmlFor={`expense-category-${suffix}`}
        error={state.errors?.category?.[0]}
      >
        <select
          id={`expense-category-${suffix}`}
          name="category"
          defaultValue={expense?.category ?? "HOUSING"}
          aria-describedby={`expense-category-${suffix}-description`}
          aria-invalid={Boolean(state.errors?.category)}
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
        hint="選んだ支払い周期1回分の金額を円単位で入力します。"
      >
        <Input
          id={`expense-amount-${suffix}`}
          name="amount"
          type="number"
          min="0"
          defaultValue={expense?.amount ?? ""}
          required
          placeholder="例：1200"
          aria-describedby={`expense-amount-${suffix}-description`}
          aria-invalid={Boolean(state.errors?.amount)}
        />
      </FormField>
      <FormField
        label="支払い周期"
        htmlFor={`expense-cycle-${suffix}`}
        error={state.errors?.billingCycle?.[0]}
        hint="毎月の支払いか、年1回の支払いかを選びます。"
      >
        <select
          id={`expense-cycle-${suffix}`}
          name="billingCycle"
          defaultValue={expense?.billing_cycle ?? "MONTHLY"}
          aria-describedby={`expense-cycle-${suffix}-description`}
          aria-invalid={Boolean(state.errors?.billingCycle)}
        >
          <option value="MONTHLY">毎月</option>
          <option value="YEARLY">毎年</option>
        </select>
      </FormField>
      <FormField
        label="支払い月"
        htmlFor={`expense-month-${suffix}`}
        error={state.errors?.billingMonth?.[0]}
        hint="「毎年」を選んだ場合のみ、1〜12で入力します。"
      >
        <Input
          id={`expense-month-${suffix}`}
          name="billingMonth"
          type="number"
          min="1"
          max="12"
          defaultValue={expense?.billing_month ?? ""}
          placeholder="例：4"
          aria-describedby={`expense-month-${suffix}-description`}
          aria-invalid={Boolean(state.errors?.billingMonth)}
        />
      </FormField>
      <div className="sm:col-span-2">
        <FormField
          label="メモ"
          htmlFor={`expense-memo-${suffix}`}
          error={state.errors?.memo?.[0]}
          hint="更新日、解約条件、契約先などを残せます。"
        >
          <Textarea
            id={`expense-memo-${suffix}`}
            name="memo"
            defaultValue={expense?.memo ?? ""}
            placeholder="例：毎年4月更新。解約は前月末まで。"
            maxLength={5000}
            aria-describedby={`expense-memo-${suffix}-description`}
            aria-invalid={Boolean(state.errors?.memo)}
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
