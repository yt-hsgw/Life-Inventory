import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Archive, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DisclosureSummary } from "@/components/ui/disclosure-summary";
import { SubmitButton } from "@/components/ui/submit-button";
import { archiveItemAction } from "@/features/items/actions";
import { ItemColorDisplay } from "@/features/items/components/item-color-display";
import { ItemStateControls } from "@/features/items/components/item-state-controls";
import { getItem } from "@/features/items/server/items";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "持ち物の詳細" };

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const { item } = await getItem(itemId);
  const details: Array<[string, ReactNode]> = [
    [
      "カテゴリ",
      `${item.category.name}${item.subCategory ? ` / ${item.subCategory.name}` : ""}`,
    ],
    ["数量", String(item.quantity)],
    ["色", <ItemColorDisplay key="item-color" value={item.color} />],
    ["サイズ", item.size ?? "—"],
    ["用途", item.purpose ?? "—"],
    [
      "購入価格",
      item.purchase_price === null ? "—" : formatCurrency(item.purchase_price),
    ],
    ["購入日", formatDate(item.purchased_at)],
    ["最終使用日", formatDate(item.last_used_at)],
  ];
  return (
    <>
      <PageHeader
        eyebrow="持ち物の詳細"
        title={item.name}
        action={
          <Link href={`/items/${item.id}/edit`} className={buttonVariants()}>
            <Pencil className="size-4" />
            編集
          </Link>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card>
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label}>
                <p className="text-muted-foreground text-xs font-bold tracking-wide">
                  {label}
                </p>
                <p className="mt-1.5 text-sm leading-6">{value}</p>
              </div>
            ))}
          </div>
          {item.product_url ? (
            <a
              className="text-primary mt-6 inline-flex text-sm font-semibold underline underline-offset-4"
              href={item.product_url}
              target="_blank"
              rel="noreferrer"
            >
              商品ページを開く
            </a>
          ) : null}
          {item.memo ? (
            <div className="border-border mt-6 border-t pt-5">
              <p className="text-muted-foreground text-xs font-bold tracking-wide">
                メモ
              </p>
              <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
                {item.memo}
              </p>
            </div>
          ) : null}
        </Card>
        <div className="space-y-5">
          <Card>
            <ItemStateControls
              itemId={item.id}
              status={item.status}
              reviewRequested={item.review_requested}
            />
          </Card>
          <Card>
            <details className="group">
              <DisclosureSummary
                closedLabel="アーカイブ入力欄を開く"
                openLabel="アーカイブ入力欄を閉じる"
                icon={<Archive className="size-4" />}
                className="text-sm"
              />
              <form action={archiveItemAction} className="mt-4 space-y-3">
                <input type="hidden" name="itemId" value={item.id} />
                <label
                  className="text-xs font-semibold"
                  htmlFor="releaseReason"
                >
                  手放す理由（任意）
                </label>
                <input
                  className="border-input h-11 w-full rounded-xl border bg-white px-3 text-sm"
                  id="releaseReason"
                  name="releaseReason"
                  maxLength={255}
                />
                <SubmitButton
                  variant="destructive"
                  className="w-full"
                  pendingLabel="アーカイブ中…"
                >
                  <Archive className="size-4" />
                  アーカイブ
                </SubmitButton>
              </form>
            </details>
          </Card>
        </div>
      </div>
    </>
  );
}
