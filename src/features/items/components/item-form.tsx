"use client";

import { useActionState, useState } from "react";
import { ListPlus, ListX, SlidersHorizontal } from "lucide-react";
import { saveItemAction } from "@/features/items/actions";
import type { CategoryWithSubs } from "@/features/categories/server/categories";
import type { ItemRow } from "@/types/database.generated";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { DisclosureSummary } from "@/components/ui/disclosure-summary";
import { ItemColorField } from "@/features/items/components/item-color-field";

export function ItemForm({
  categories,
  item,
}: {
  categories: CategoryWithSubs[];
  item?: ItemRow;
}) {
  const [state, action] = useActionState(saveItemAction, INITIAL_ACTION_STATE);
  const [categoryId, setCategoryId] = useState(
    item?.category_id ?? categories[0]?.id ?? "",
  );
  const [reviewRequested, setReviewRequested] = useState(
    item?.review_requested ?? false,
  );
  const subCategories =
    categories.find((category) => category.id === categoryId)?.subCategories ??
    [];
  return (
    <form action={action} noValidate className="space-y-5">
      {item ? <input type="hidden" name="itemId" value={item.id} /> : null}
      <Card className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormField
            label="持ち物の名前"
            htmlFor="name"
            error={state.errors?.name?.[0]}
          >
            <Input
              id="name"
              name="name"
              defaultValue={item?.name}
              maxLength={100}
              autoFocus
              required
              aria-describedby="name-description"
            />
          </FormField>
        </div>
        <FormField
          label="カテゴリ"
          htmlFor="categoryId"
          error={state.errors?.categoryId?.[0]}
        >
          <select
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
            aria-describedby="categoryId-description"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="数量"
          htmlFor="quantity"
          error={state.errors?.quantity?.[0]}
        >
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            max="1000000"
            defaultValue={item?.quantity ?? 1}
            required
            aria-describedby="quantity-description"
          />
        </FormField>
      </Card>
      <details
        className="group border-border bg-card rounded-3xl border p-6"
        open={Boolean(item)}
      >
        <DisclosureSummary
          closedLabel="詳細情報を開く"
          openLabel="詳細情報を閉じる"
          icon={<SlidersHorizontal className="size-4" />}
        />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <FormField label="サブカテゴリ" htmlFor="subCategoryId">
            <select
              id="subCategoryId"
              name="subCategoryId"
              defaultValue={item?.sub_category_id ?? ""}
            >
              <option value="">未選択</option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="状態" htmlFor="status">
            <select
              id="status"
              name="status"
              defaultValue={item?.status ?? "KEEP"}
            >
              <option value="KEEP">残す</option>
              <option value="MAYBE">迷っている</option>
              <option value="RELEASE">手放す</option>
            </select>
          </FormField>
          <div className="md:col-span-2">
            <ItemColorField
              defaultValue={item?.color}
              error={state.errors?.color?.[0]}
            />
          </div>
          <FormField label="サイズ" htmlFor="size">
            <Input
              id="size"
              name="size"
              defaultValue={item?.size ?? ""}
              maxLength={50}
            />
          </FormField>
          <FormField label="用途" htmlFor="purpose">
            <Input
              id="purpose"
              name="purpose"
              defaultValue={item?.purpose ?? ""}
              maxLength={255}
            />
          </FormField>
          <FormField
            label="商品ページURL"
            htmlFor="productUrl"
            error={state.errors?.productUrl?.[0]}
          >
            <Input
              id="productUrl"
              name="productUrl"
              type="url"
              defaultValue={item?.product_url ?? ""}
              maxLength={2048}
              aria-describedby="productUrl-description"
            />
          </FormField>
          <FormField label="購入価格" htmlFor="purchasePrice">
            <Input
              id="purchasePrice"
              name="purchasePrice"
              type="number"
              min="0"
              defaultValue={item?.purchase_price ?? ""}
            />
          </FormField>
          <FormField label="購入日" htmlFor="purchasedAt">
            <Input
              id="purchasedAt"
              name="purchasedAt"
              type="date"
              defaultValue={item?.purchased_at ?? ""}
            />
          </FormField>
          <FormField label="最終使用日" htmlFor="lastUsedAt">
            <Input
              id="lastUsedAt"
              name="lastUsedAt"
              type="date"
              defaultValue={item?.last_used_at ?? ""}
            />
          </FormField>
          <label className="bg-secondary flex items-center gap-3 self-end rounded-xl p-3 text-sm font-semibold">
            <input
              name="reviewRequested"
              type="checkbox"
              checked={reviewRequested}
              onChange={(event) =>
                setReviewRequested(event.currentTarget.checked)
              }
              className="accent-primary size-4"
            />
            {reviewRequested ? (
              <ListX className="size-4" aria-hidden="true" />
            ) : (
              <ListPlus className="size-4" aria-hidden="true" />
            )}
            {reviewRequested ? "見直しを解除" : "見直しに追加"}
          </label>
          <div className="md:col-span-2">
            <FormField label="メモ" htmlFor="memo">
              <Textarea
                id="memo"
                name="memo"
                defaultValue={item?.memo ?? ""}
                maxLength={5000}
              />
            </FormField>
          </div>
        </div>
      </details>
      {state.message ? (
        <p
          className="bg-secondary text-destructive rounded-xl p-3 text-sm"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton>{item ? "変更を保存" : "持ち物を追加"}</SubmitButton>
    </form>
  );
}
