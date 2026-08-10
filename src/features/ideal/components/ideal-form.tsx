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
          label="Name"
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
        label="Category"
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
        label="Ideal Quantity"
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
      <FormField
        label="Estimated Price"
        htmlFor={`ideal-price-${item?.id ?? "new"}`}
      >
        <Input
          id={`ideal-price-${item?.id ?? "new"}`}
          name="estimatedPrice"
          type="number"
          min="0"
          defaultValue={item?.estimated_price ?? ""}
        />
      </FormField>
      <FormField
        label="Priority"
        htmlFor={`ideal-priority-${item?.id ?? "new"}`}
      >
        <select
          id={`ideal-priority-${item?.id ?? "new"}`}
          name="priority"
          defaultValue={item?.priority ?? ""}
        >
          <option value="">未設定</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </FormField>
      <div className="sm:col-span-2">
        <FormField label="Memo" htmlFor={`ideal-memo-${item?.id ?? "new"}`}>
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
        <SubmitButton>{item ? "Idealを更新" : "Idealを追加"}</SubmitButton>
      </div>
    </form>
  );
}
