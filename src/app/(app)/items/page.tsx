import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { ItemList } from "@/features/items/components/item-list";
import { getItems } from "@/features/items/server/items";

export const metadata: Metadata = { title: "Items" };

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const result = await getItems(await searchParams);
  return (
    <>
      <PageHeader
        eyebrow="CURRENT"
        title="Items"
        description={`${result.items.reduce((total, item) => total + item.quantity, 0)}個の持ち物を表示しています。`}
        action={
          <Link href="/items/new" className={buttonVariants()}>
            <Plus className="size-4" />
            Add Item
          </Link>
        }
      />
      <ItemList {...result} />
    </>
  );
}
