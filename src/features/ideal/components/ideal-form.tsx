"use client";

import { useActionState } from "react";
import { saveIdealAction } from "@/features/ideal/actions";
import type { CategoryWithSubs } from "@/features/categories/server/categories";
import type { IdealItemRow } from "@/types/database.generated";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

export function IdealForm({
  categories,
  item,
}: {
  categories: CategoryWithSubs[];
  item?: IdealItemRow;
}) {
  const [state, action] = useActionState(saveIdealAction, INITIAL_ACTION_STATE);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      {item ? <input type="hidden" name="idealItemId" value={item.id} /> : null}
      <div className="sm:col-span-2">
        <FormField
          label="名前"
          htmlFor={`ideal-name-${item?.id ?? "new"}`}
          error={state.errors?.name?.[0]}
        >
          <Input
            id={`ideal-name-${item?.id ?? "new"}`}
            name="name"
            defaultValue={item?.name}
            maxLength={100}
            required
          />
        </FormField>
      </div>
      <FormField
        label="カテゴリ"
        htmlFor={`ideal-category-${item?.id ?? "new"}`}
      >
        <select
          id={`ideal-category-${item?.id ?? "new"}`}
          name="categoryId"
          defaultValue={item?.category_id ?? categories[0]?.id}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </FormField>
      <FormField
        label="理想の数量"
        htmlFor={`ideal-quantity-${item?.id ?? "new"}`}
        error={state.errors?.targetQuantity?.[0]}
      >
        <Input
          id={`ideal-quantity-${item?.id ?? "new"}`}
          name="targetQuantity"
          type="number"
          min="0"
          defaultValue={item?.target_quantity ?? 1}
          required
        />
      </FormField>
      <FormField label="想定価格" htmlFor={`ideal-price-${item?.id ?? "new"}`}>
        <Input
          id={`ideal-price-${item?.id ?? "new"}`}
          name="estimatedPrice"
          type="number"
          min="0"
          defaultValue={item?.estimated_price ?? ""}
        />
      </FormField>
      <FormField label="優先度" htmlFor={`ideal-priority-${item?.id ?? "new"}`}>
        <select
          id={`ideal-priority-${item?.id ?? "new"}`}
          name="priority"
          defaultValue={item?.priority ?? ""}
        >
          <option value="">未設定</option>
          <option value="LOW">低</option>
          <option value="MEDIUM">中</option>
          <option value="HIGH">高</option>
        </select>
      </FormField>
      <div className="sm:col-span-2">
        <FormField label="メモ" htmlFor={`ideal-memo-${item?.id ?? "new"}`}>
          <Textarea
            id={`ideal-memo-${item?.id ?? "new"}`}
            name="memo"
            defaultValue={item?.memo ?? ""}
          />
        </FormField>
      </div>
      {state.message ? (
        <p className="text-destructive text-sm sm:col-span-2" role="alert">
          {state.message}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <SubmitButton pendingLabel="理想の持ち物を保存中…">
          {item ? "理想の持ち物を更新" : "理想の持ち物を追加"}
        </SubmitButton>
      </div>
    </form>
  );
}
