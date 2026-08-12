import { ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CategoryWithSubs } from "@/features/categories/server/categories";
import { ItemColorDisplay } from "@/features/items/components/item-color-display";
import { ITEM_STATUS_LABELS, type ItemView } from "@/features/items/types";
import { cn } from "@/lib/utils";

export function ItemList({
  items,
  categories,
  filters,
}: {
  items: ItemView[];
  categories: CategoryWithSubs[];
  filters: { q: string; category: string; status: string };
}) {
  return (
    <div className="space-y-5">
      <Card>
        <form
          className="grid gap-3 md:grid-cols-[1fr_13rem_11rem_auto]"
          action="/items"
        >
          <div className="relative">
            <Search className="text-muted-foreground absolute top-3.5 left-3 size-4" />
            <Input
              className="pl-9"
              name="q"
              defaultValue={filters.q}
              placeholder="名前・用途・メモを検索"
              maxLength={100}
              aria-label="持ち物を検索"
            />
          </div>
          <select
            name="category"
            defaultValue={filters.category}
            aria-label="カテゴリで絞り込む"
          >
            <option value="">すべてのカテゴリ</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={filters.status}
            aria-label="状態で絞り込む"
          >
            <option value="">すべての状態</option>
            <option value="KEEP">残す</option>
            <option value="MAYBE">迷っている</option>
            <option value="RELEASE">手放す</option>
          </select>
          <button
            className={buttonVariants({ variant: "outline" })}
            type="submit"
          >
            絞り込む
          </button>
        </form>
      </Card>
      {items.length === 0 ? (
        <EmptyState
          title="持ち物が見つかりません"
          description="条件を変えるか、最初の持ち物を追加してみましょう。"
          action={
            <Link className={buttonVariants()} href="/items/new">
              持ち物を追加
            </Link>
          }
        />
      ) : (
        <div className="divide-border border-border bg-card divide-y overflow-hidden rounded-3xl border">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="group hover:bg-secondary/60 focus-visible:ring-primary grid gap-3 p-5 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset sm:grid-cols-[1fr_auto_auto] sm:items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{item.name}</h2>
                  <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span>
                    {item.category.name}
                    {item.subCategory ? ` / ${item.subCategory.name}` : ""}
                  </span>
                  {item.color ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <ItemColorDisplay value={item.color} compact />
                    </>
                  ) : null}
                </div>
              </div>
              <Badge
                className={cn(
                  item.status === "RELEASE" &&
                    "bg-destructive/10 text-destructive",
                  item.status === "MAYBE" && "bg-warning/10 text-warning",
                )}
              >
                {ITEM_STATUS_LABELS[item.status]}
              </Badge>
              <p className="font-numeric text-sm font-semibold">
                × {item.quantity}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
