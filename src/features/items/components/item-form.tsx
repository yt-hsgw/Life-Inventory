"use client";

import { useActionState, useRef, useState } from "react";
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
import { ItemPhotoUploader } from "@/features/items/components/item-photo-uploader";
import type { ItemPhotoAnalysis } from "@/features/items/domain/item-photo-analysis";

export function ItemForm({
  categories,
  item,
}: {
  categories: CategoryWithSubs[];
  item?: ItemRow & { photos?: Array<{ id: string }> };
}) {
  const [state, action] = useActionState(saveItemAction, INITIAL_ACTION_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const hasAppliedPhotoAnalysisRef = useRef(false);
  const [categoryId, setCategoryId] = useState(
    item?.category_id ?? categories[0]?.id ?? "",
  );
  const [subCategoryId, setSubCategoryId] = useState(
    item?.sub_category_id ?? "",
  );
  const [color, setColor] = useState(item?.color ?? "");
  const [photoUploadBusy, setPhotoUploadBusy] = useState(false);
  const [reviewRequested, setReviewRequested] = useState(
    item?.review_requested ?? false,
  );
  const subCategories =
    categories.find((category) => category.id === categoryId)?.subCategories ??
    [];

  function applyPhotoAnalysis(analysis: ItemPhotoAnalysis) {
    if (hasAppliedPhotoAnalysisRef.current) return;
    hasAppliedPhotoAnalysisRef.current = true;
    const form = formRef.current;
    if (!form) return;

    const setIfEmpty = (name: string, value?: string | null) => {
      if (!value) return;
      const field = form.elements.namedItem(name);
      if (
        (field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement) &&
        field.value.trim() === ""
      ) {
        field.value = value;
      }
    };

    setIfEmpty("name", analysis.name);
    setIfEmpty("size", analysis.size);
    setIfEmpty("purpose", analysis.purpose);
    setIfEmpty("memo", analysis.memo);
    if (analysis.colorHex && !color) setColor(analysis.colorHex);
    if (item) return;

    const matchedCategory = categories.find(
      (category) =>
        analysis.categoryName &&
        category.name.trim().toLocaleLowerCase() ===
          analysis.categoryName.trim().toLocaleLowerCase(),
    );
    if (!matchedCategory) return;

    setCategoryId(matchedCategory.id);
    const matchedSubCategory = matchedCategory.subCategories.find(
      (subCategory) =>
        analysis.subCategoryName &&
        subCategory.name.trim().toLocaleLowerCase() ===
          analysis.subCategoryName.trim().toLocaleLowerCase(),
    );
    setSubCategoryId(matchedSubCategory?.id ?? "");
  }

  return (
    <form ref={formRef} action={action} noValidate className="space-y-5">
      {item ? <input type="hidden" name="itemId" value={item.id} /> : null}
      <ItemPhotoUploader
        existingCount={item?.photos?.length ?? 0}
        onAnalysis={applyPhotoAnalysis}
        onBusyChange={setPhotoUploadBusy}
      />
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
              autoFocus={Boolean(item)}
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
            onChange={(event) => {
              setCategoryId(event.target.value);
              setSubCategoryId("");
            }}
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
          <p className="text-muted-foreground text-sm leading-6 md:col-span-2">
            すべて任意です。分かる範囲だけ入力し、あとから更新できます。
          </p>
          <FormField
            label="サブカテゴリ"
            htmlFor="subCategoryId"
            error={state.errors?.subCategoryId?.[0]}
            hint="カテゴリをさらに細かく整理したいときに選びます。"
          >
            <select
              id="subCategoryId"
              name="subCategoryId"
              value={subCategoryId}
              onChange={(event) => setSubCategoryId(event.target.value)}
              aria-describedby="subCategoryId-description"
              aria-invalid={Boolean(state.errors?.subCategoryId)}
            >
              <option value="">未選択</option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label="状態"
            htmlFor="status"
            error={state.errors?.status?.[0]}
            hint="「迷っている」にすると、見直し画面の対象になります。"
          >
            <select
              id="status"
              name="status"
              defaultValue={item?.status ?? "KEEP"}
              aria-describedby="status-description"
              aria-invalid={Boolean(state.errors?.status)}
            >
              <option value="KEEP">残す</option>
              <option value="MAYBE">迷っている</option>
              <option value="RELEASE">手放す</option>
            </select>
          </FormField>
          <div className="md:col-span-2">
            <ItemColorField
              defaultValue={item?.color}
              value={color}
              onValueChange={setColor}
              error={state.errors?.color?.[0]}
            />
          </div>
          <FormField
            label="サイズ"
            htmlFor="size"
            error={state.errors?.size?.[0]}
            hint="例：M、27cm、幅120 × 奥行60cm"
          >
            <Input
              id="size"
              name="size"
              defaultValue={item?.size ?? ""}
              maxLength={50}
              placeholder="例：M、27cm"
              aria-describedby="size-description"
              aria-invalid={Boolean(state.errors?.size)}
            />
          </FormField>
          <FormField
            label="用途"
            htmlFor="purpose"
            error={state.errors?.purpose?.[0]}
            hint="例：仕事用、来客用、週末のランニング"
          >
            <Input
              id="purpose"
              name="purpose"
              defaultValue={item?.purpose ?? ""}
              maxLength={255}
              placeholder="例：仕事用"
              aria-describedby="purpose-description"
              aria-invalid={Boolean(state.errors?.purpose)}
            />
          </FormField>
          <FormField
            label="商品ページURL"
            htmlFor="productUrl"
            error={state.errors?.productUrl?.[0]}
            hint="商品を確認できる http:// または https:// のURLを入力します。"
          >
            <Input
              id="productUrl"
              name="productUrl"
              type="url"
              defaultValue={item?.product_url ?? ""}
              maxLength={2048}
              placeholder="https://example.com/item"
              aria-describedby="productUrl-description"
              aria-invalid={Boolean(state.errors?.productUrl)}
            />
          </FormField>
          <FormField
            label="購入価格"
            htmlFor="purchasePrice"
            error={state.errors?.purchasePrice?.[0]}
            hint="購入時の税込価格を円単位（整数）で入力します。"
          >
            <Input
              id="purchasePrice"
              name="purchasePrice"
              type="number"
              min="0"
              defaultValue={item?.purchase_price ?? ""}
              placeholder="例：2980"
              aria-describedby="purchasePrice-description"
              aria-invalid={Boolean(state.errors?.purchasePrice)}
            />
          </FormField>
          <FormField
            label="購入日"
            htmlFor="purchasedAt"
            error={state.errors?.purchasedAt?.[0]}
            hint="購入日が分かる場合だけ選択します。"
          >
            <Input
              id="purchasedAt"
              name="purchasedAt"
              type="date"
              defaultValue={item?.purchased_at ?? ""}
              aria-describedby="purchasedAt-description"
              aria-invalid={Boolean(state.errors?.purchasedAt)}
            />
          </FormField>
          <FormField
            label="最終使用日"
            htmlFor="lastUsedAt"
            error={state.errors?.lastUsedAt?.[0]}
            hint="最後に使った日です。見直すときの判断材料になります。"
          >
            <Input
              id="lastUsedAt"
              name="lastUsedAt"
              type="date"
              defaultValue={item?.last_used_at ?? ""}
              aria-describedby="lastUsedAt-description"
              aria-invalid={Boolean(state.errors?.lastUsedAt)}
            />
          </FormField>
          <div className="space-y-2 self-end">
            <label className="bg-secondary flex min-h-11 items-center gap-3 rounded-xl p-3 text-sm font-semibold">
              <input
                name="reviewRequested"
                type="checkbox"
                checked={reviewRequested}
                onChange={(event) =>
                  setReviewRequested(event.currentTarget.checked)
                }
                className="accent-primary size-4"
                aria-describedby="reviewRequested-description"
              />
              {reviewRequested ? (
                <ListX className="size-4" aria-hidden="true" />
              ) : (
                <ListPlus className="size-4" aria-hidden="true" />
              )}
              {reviewRequested ? "見直しを解除" : "見直しに追加"}
            </label>
            <p
              id="reviewRequested-description"
              className="text-muted-foreground text-xs"
            >
              オンにすると見直し対象へ追加します。「迷っている」はオフでも対象です。
            </p>
          </div>
          <div className="md:col-span-2">
            <FormField
              label="メモ"
              htmlFor="memo"
              error={state.errors?.memo?.[0]}
              hint="使用感、保管場所、手放せない理由などを自由に残せます。"
            >
              <Textarea
                id="memo"
                name="memo"
                defaultValue={item?.memo ?? ""}
                maxLength={5000}
                placeholder="例：書斎の引き出しに保管。月に1回ほど使用。"
                aria-describedby="memo-description"
                aria-invalid={Boolean(state.errors?.memo)}
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
      <SubmitButton disabled={photoUploadBusy} pendingLabel="持ち物を保存中…">
        {item ? "変更を保存" : "持ち物を追加"}
      </SubmitButton>
    </form>
  );
}
