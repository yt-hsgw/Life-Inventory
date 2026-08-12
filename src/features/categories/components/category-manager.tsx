"use client";

import { useActionState } from "react";
import { Plus, Save } from "lucide-react";
import {
  saveCategoryAction,
  saveSubCategoryAction,
} from "@/features/categories/actions";
import type { CategoryWithSubs } from "@/features/categories/server/categories";
import type { SubCategory } from "@/types/database.generated";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const SUGGESTED_CATEGORIES = [
  "デジタル・家電",
  "健康・美容",
  "移動・旅行",
  "防災・備蓄",
  "思い出・コレクション",
  "その他",
] as const;

function NewCategoryForm() {
  const [state, action] = useActionState(
    saveCategoryAction,
    INITIAL_ACTION_STATE,
  );
  return (
    <form action={action} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
      <Input
        name="name"
        maxLength={50}
        placeholder="新しいカテゴリ名"
        aria-label="新しいカテゴリ名"
        required
      />
      <input type="hidden" name="sortOrder" value="100" />
      <SubmitButton pendingLabel="カテゴリを追加中…">
        <Plus className="size-4" />
        追加
      </SubmitButton>
      {state.message ? (
        <p className="text-destructive col-span-2 text-sm" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function PresetCategoryButton({
  name,
  sortOrder,
}: {
  name: string;
  sortOrder: number;
}) {
  const [state, action] = useActionState(
    saveCategoryAction,
    INITIAL_ACTION_STATE,
  );
  return (
    <form action={action}>
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="sortOrder" value={sortOrder} />
      <SubmitButton variant="outline" size="sm" pendingLabel="追加中…">
        <Plus className="size-3.5" />
        {name}
      </SubmitButton>
      {state.message ? (
        <span className="sr-only" role="alert">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}

function SubCategoryRow({
  category,
  subCategory,
}: {
  category: CategoryWithSubs;
  subCategory: SubCategory;
}) {
  const [state, action] = useActionState(
    saveSubCategoryAction,
    INITIAL_ACTION_STATE,
  );
  return (
    <form action={action} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
      <input type="hidden" name="id" value={subCategory.id} />
      <input type="hidden" name="categoryId" value={category.id} />
      <input type="hidden" name="sortOrder" value={subCategory.sort_order} />
      <Input
        name="name"
        defaultValue={subCategory.name}
        maxLength={50}
        aria-label={`${subCategory.name}の名前`}
        required
      />
      <SubmitButton variant="outline" pendingLabel="更新中…">
        <Save className="size-4" />
        更新
      </SubmitButton>
      {state.message ? (
        <p className="text-destructive col-span-2 text-sm" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function CategoryRow({ category }: { category: CategoryWithSubs }) {
  const [categoryState, categoryAction] = useActionState(
    saveCategoryAction,
    INITIAL_ACTION_STATE,
  );
  const [subState, subAction] = useActionState(
    saveSubCategoryAction,
    INITIAL_ACTION_STATE,
  );
  return (
    <Card>
      <form
        action={categoryAction}
        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
      >
        <input type="hidden" name="id" value={category.id} />
        <input type="hidden" name="sortOrder" value={category.sort_order} />
        <Input
          name="name"
          defaultValue={category.name}
          maxLength={50}
          aria-label={`${category.name}の名前`}
          required
        />
        <SubmitButton variant="outline" pendingLabel="更新中…">
          <Save className="size-4" />
          更新
        </SubmitButton>
      </form>
      {categoryState.message ? (
        <p className="text-destructive mt-2 text-sm" role="alert">
          {categoryState.message}
        </p>
      ) : null}
      <div className="border-border mt-5 border-t pt-5">
        <p className="text-muted-foreground text-xs font-bold tracking-wide">
          サブカテゴリ
        </p>
        {category.subCategories.length ? (
          <div className="mt-3 space-y-2">
            {category.subCategories.map((sub) => (
              <SubCategoryRow
                key={sub.id}
                category={category}
                subCategory={sub}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mt-3 text-sm">まだありません。</p>
        )}
        <form
          action={subAction}
          className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3"
        >
          <input type="hidden" name="categoryId" value={category.id} />
          <input
            type="hidden"
            name="sortOrder"
            value={category.subCategories.length}
          />
          <Input
            name="name"
            maxLength={50}
            placeholder="サブカテゴリを追加"
            aria-label={`${category.name}にサブカテゴリを追加`}
            required
          />
          <SubmitButton variant="ghost" pendingLabel="追加中…">
            <Plus className="size-4" />
            追加
          </SubmitButton>
        </form>
        {subState.message ? (
          <p className="text-destructive mt-2 text-sm" role="alert">
            {subState.message}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

export function CategoryManager({
  categories,
}: {
  categories: CategoryWithSubs[];
}) {
  const existingNames = new Set(
    categories.map((category) => category.name.toLocaleLowerCase("ja")),
  );
  const suggestions = SUGGESTED_CATEGORIES.filter(
    (name) => !existingNames.has(name.toLocaleLowerCase("ja")),
  );

  return (
    <div className="space-y-5">
      <NewCategoryForm />
      {suggestions.length ? (
        <Card>
          <p className="font-semibold">おすすめカテゴリ</p>
          <p className="text-muted-foreground mt-1 text-sm">
            必要なものだけ追加できます。既存カテゴリは自動変更しません。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((name, index) => (
              <PresetCategoryButton
                key={name}
                name={name}
                sortOrder={categories.length + index + 100}
              />
            ))}
          </div>
        </Card>
      ) : null}
      {categories.map((category) => (
        <CategoryRow key={category.id} category={category} />
      ))}
    </div>
  );
}
