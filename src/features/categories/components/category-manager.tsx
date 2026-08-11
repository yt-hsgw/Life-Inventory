"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import {
  saveCategoryAction,
  saveSubCategoryAction,
} from "@/features/categories/actions";
import type { CategoryWithSubs } from "@/features/categories/server/categories";
import type { SubCategory } from "@/types/database.generated";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function NewCategoryForm() {
  const [state, action] = useActionState(
    saveCategoryAction,
    INITIAL_ACTION_STATE,
  );
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row">
      <Input
        name="name"
        maxLength={50}
        placeholder="新しいカテゴリ名"
        aria-label="新しいカテゴリ名"
        required
      />
      <input type="hidden" name="sortOrder" value="100" />
      <Button type="submit">
        <Plus className="size-4" />
        追加
      </Button>
      {state.message ? (
        <p className="text-destructive text-sm" role="alert">
          {state.message}
        </p>
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
    <form action={action} className="flex flex-col gap-2 sm:flex-row">
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
      <Button type="submit" variant="outline">
        更新
      </Button>
      {state.message ? (
        <p className="text-destructive self-center text-sm" role="alert">
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
      <form action={categoryAction} className="flex items-center gap-3">
        <input type="hidden" name="id" value={category.id} />
        <input type="hidden" name="sortOrder" value={category.sort_order} />
        <Input
          name="name"
          defaultValue={category.name}
          maxLength={50}
          aria-label={`${category.name}の名前`}
          required
        />
        <Button type="submit" variant="outline">
          更新
        </Button>
      </form>
      {categoryState.message ? (
        <p className="text-destructive mt-2 text-sm" role="alert">
          {categoryState.message}
        </p>
      ) : null}
      <div className="border-border mt-5 border-t pt-5">
        <p className="text-muted-foreground text-xs font-bold tracking-wide">
          SUB CATEGORIES
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
          className="mt-4 flex flex-col gap-3 sm:flex-row"
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
          <Button type="submit" variant="ghost">
            追加
          </Button>
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
  return (
    <div className="space-y-5">
      <NewCategoryForm />
      {categories.map((category) => (
        <CategoryRow key={category.id} category={category} />
      ))}
    </div>
  );
}
