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
          hint="例：仕事用の椅子、旅行用バッグ"
        >
          <Input
            id={`ideal-name-${item?.id ?? "new"}`}
            name="name"
            defaultValue={item?.name}
            maxLength={100}
            required
            placeholder="例：仕事用の椅子"
            aria-describedby={`ideal-name-${item?.id ?? "new"}-description`}
            aria-invalid={Boolean(state.errors?.name)}
          />
        </FormField>
      </div>
      <FormField
        label="カテゴリ"
        htmlFor={`ideal-category-${item?.id ?? "new"}`}
        error={state.errors?.categoryId?.[0]}
      >
        <select
          id={`ideal-category-${item?.id ?? "new"}`}
          name="categoryId"
          defaultValue={item?.category_id ?? categories[0]?.id}
          aria-describedby={`ideal-category-${item?.id ?? "new"}-description`}
          aria-invalid={Boolean(state.errors?.categoryId)}
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
        hint="将来持ちたい数量です。0なら持たない状態を表します。"
      >
        <Input
          id={`ideal-quantity-${item?.id ?? "new"}`}
          name="targetQuantity"
          type="number"
          min="0"
          defaultValue={item?.target_quantity ?? 1}
          required
          aria-describedby={`ideal-quantity-${item?.id ?? "new"}-description`}
          aria-invalid={Boolean(state.errors?.targetQuantity)}
        />
      </FormField>
      <FormField
        label="想定価格"
        htmlFor={`ideal-price-${item?.id ?? "new"}`}
        error={state.errors?.estimatedPrice?.[0]}
        hint="1個あたりの目安を円単位（整数）で入力します。"
      >
        <Input
          id={`ideal-price-${item?.id ?? "new"}`}
          name="estimatedPrice"
          type="number"
          min="0"
          defaultValue={item?.estimated_price ?? ""}
          placeholder="例：30000"
          aria-describedby={`ideal-price-${item?.id ?? "new"}-description`}
          aria-invalid={Boolean(state.errors?.estimatedPrice)}
        />
      </FormField>
      <FormField
        label="優先度"
        htmlFor={`ideal-priority-${item?.id ?? "new"}`}
        error={state.errors?.priority?.[0]}
        hint="迎え入れる順番を考えるための目安です。"
      >
        <select
          id={`ideal-priority-${item?.id ?? "new"}`}
          name="priority"
          defaultValue={item?.priority ?? ""}
          aria-describedby={`ideal-priority-${item?.id ?? "new"}-description`}
          aria-invalid={Boolean(state.errors?.priority)}
        >
          <option value="">未設定</option>
          <option value="LOW">低</option>
          <option value="MEDIUM">中</option>
          <option value="HIGH">高</option>
        </select>
      </FormField>
      <div className="sm:col-span-2">
        <FormField
          label="メモ"
          htmlFor={`ideal-memo-${item?.id ?? "new"}`}
          error={state.errors?.memo?.[0]}
          hint="必要な理由や、迎え入れる条件を残せます。"
        >
          <Textarea
            id={`ideal-memo-${item?.id ?? "new"}`}
            name="memo"
            defaultValue={item?.memo ?? ""}
            placeholder="例：今の椅子を手放してから検討する。"
            maxLength={5000}
            aria-describedby={`ideal-memo-${item?.id ?? "new"}-description`}
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
        <SubmitButton pendingLabel="理想の持ち物を保存中…">
          {item ? "理想の持ち物を更新" : "理想の持ち物を追加"}
        </SubmitButton>
      </div>
    </form>
  );
}
