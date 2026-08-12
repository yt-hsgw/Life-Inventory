import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ItemForm } from "@/features/items/components/item-form";
import { getCategories } from "@/features/categories/server/categories";

export const metadata: Metadata = { title: "持ち物を追加" };

export default async function NewItemPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHeader
        eyebrow="新しい持ち物"
        title="持ち物を追加"
        description="まずは名前・カテゴリ・数量だけで登録できます。"
      />
      <ItemForm categories={categories} />
    </>
  );
}
