import type { Metadata } from "next";
import Link from "next/link";
import { Archive, ListChecks, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  archiveItemAction,
  requestReviewAction,
  updateItemStatusAction,
} from "@/features/items/actions";
import { getItem } from "@/features/items/server/items";
import { ITEM_STATUS_LABELS } from "@/features/items/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "持ち物の詳細" };

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const { item } = await getItem(itemId);
  const details = [
    [
      "カテゴリ",
      `${item.category.name}${item.subCategory ? ` / ${item.subCategory.name}` : ""}`,
    ],
    ["数量", String(item.quantity)],
    ["色", item.color ?? "—"],
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
            <p className="text-muted-foreground text-xs font-bold tracking-wide">
              状態
            </p>
            <Badge className="mt-3">{ITEM_STATUS_LABELS[item.status]}</Badge>
            <form action={updateItemStatusAction} className="mt-5 space-y-3">
              <input type="hidden" name="itemId" value={item.id} />
              <select
                name="status"
                defaultValue={item.status}
                aria-label="状態を変更"
              >
                <option value="KEEP">残す</option>
                <option value="MAYBE">迷っている</option>
                <option value="RELEASE">手放す</option>
              </select>
              <Button type="submit" variant="outline" className="w-full">
                状態を更新
              </Button>
            </form>
            <form action={requestReviewAction} className="mt-3">
              <input type="hidden" name="itemId" value={item.id} />
              <Button type="submit" variant="ghost" className="w-full">
                <ListChecks className="size-4" />
                {item.review_requested ? "見直しに追加済み" : "見直しに追加"}
              </Button>
            </form>
          </Card>
          <Card>
            <details>
              <summary className="focus-visible:ring-primary cursor-pointer text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none">
                アーカイブする
              </summary>
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
                <Button type="submit" variant="destructive" className="w-full">
                  <Archive className="size-4" />
                  アーカイブ
                </Button>
              </form>
            </details>
          </Card>
        </div>
      </div>
    </>
  );
}
