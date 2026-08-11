import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ItemForm } from "@/features/items/components/item-form";
import { getItem } from "@/features/items/server/items";

export const metadata: Metadata = { title: "持ち物を編集" };

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const { item, categories } = await getItem(itemId);
  return (
    <>
      <PageHeader
        eyebrow="持ち物を編集"
        title={item.name}
        description="持ち物の情報と、今の判断を更新します。"
      />
      <ItemForm item={item} categories={categories} />
    </>
  );
}
