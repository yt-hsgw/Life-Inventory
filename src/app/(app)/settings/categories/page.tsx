import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CategoryManager } from "@/features/categories/components/category-manager";
import { getCategories } from "@/features/categories/server/categories";

export const metadata: Metadata = { title: "カテゴリ設定" };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHeader
        eyebrow="SETTINGS"
        title="Categories"
        description="持ち物を見るときの、自分なりのまとまりを整えます。"
      />
      <CategoryManager categories={categories} />
    </>
  );
}
