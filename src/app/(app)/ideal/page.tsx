import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { DisclosureSummary } from "@/components/ui/disclosure-summary";
import { EmptyState } from "@/components/feedback/empty-state";
import { IdealForm } from "@/features/ideal/components/ideal-form";
import { deleteIdealAction } from "@/features/ideal/actions";
import { getIdealComparisons } from "@/features/ideal/server/ideal";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "理想" };

export default async function IdealPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const requested = (await searchParams).filter?.toUpperCase() ?? "ALL";
  const filter = ["ALL", "REDUCE", "ADD", "MATCHED"].includes(requested)
    ? requested
    : "ALL";
  const { comparisons, allComparisons, categories } =
    await getIdealComparisons(filter);
  const currentTotal = allComparisons.reduce(
    (sum, item) => sum + item.currentQuantity,
    0,
  );
  const targetTotal = allComparisons.reduce(
    (sum, item) => sum + item.target_quantity,
    0,
  );
  return (
    <>
      <PageHeader
        eyebrow="今と理想"
        title="理想"
        description="減らすことだけでなく、必要なものを足すことも同じように見渡します。"
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-muted-foreground text-xs">現在</p>
          <p className="font-numeric mt-2 text-3xl font-semibold">{currentTotal}</p>
        </Card>
        <Card>
          <p className="text-muted-foreground text-xs">理想</p>
          <p className="font-numeric text-primary mt-2 text-3xl font-semibold">
            {targetTotal}
          </p>
        </Card>
        <Card>
          <p className="text-muted-foreground text-xs">差</p>
          <p className="font-numeric mt-2 text-3xl font-semibold">
            {targetTotal - currentTotal > 0 ? "+" : ""}
            {targetTotal - currentTotal}
          </p>
        </Card>
      </div>
      <Card className="mb-5">
        <details className="group">
          <DisclosureSummary
            closedLabel="理想の持ち物の入力欄を開く"
            openLabel="理想の持ち物の入力欄を閉じる"
          />
          <div className="mt-6">
            <IdealForm categories={categories} />
          </div>
        </details>
      </Card>
      <nav
        className="mb-5 flex flex-wrap gap-2"
        aria-label="理想の持ち物の絞り込み"
      >
        {["ALL", "REDUCE", "ADD", "MATCHED"].map((value) => (
          <Link
            key={value}
            href={`/ideal?filter=${value}`}
            className={cn(
              buttonVariants({
                variant: filter === value ? "default" : "outline",
                size: "sm",
              }),
            )}
          >
            {value === "ALL"
              ? "すべて"
              : value === "REDUCE"
                ? "減らす"
                : value === "ADD"
                  ? "増やす"
                  : "一致"}
          </Link>
        ))}
      </nav>
      {comparisons.length === 0 ? (
        <EmptyState
          title="理想を描いてみましょう"
          description="理想の数量を決めると、現在との差がここに現れます。"
        />
      ) : (
        <div className="space-y-3">
          {comparisons.map((item) => (
            <Card key={item.id}>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="text-muted-foreground text-xs">
                    {item.categoryName}
                  </p>
                  <h2 className="mt-1 font-semibold">{item.name}</h2>
                  {item.estimated_price !== null ? (
                    <p className="text-muted-foreground mt-1 text-xs">
                      目安 {formatCurrency(item.estimated_price)}
                    </p>
                  ) : null}
                </div>
                <p className="font-numeric text-sm">
                  <strong>{item.currentQuantity}</strong>{" "}
                  <span className="text-muted-foreground mx-2">→</span>{" "}
                  <strong>{item.target_quantity}</strong>
                </p>
                <p
                  className={cn(
                    "font-numeric min-w-16 text-right text-xl font-semibold",
                    item.gap < 0 && "text-warning",
                    item.gap > 0 && "text-primary",
                  )}
                >
                  {item.gap > 0 ? "+" : ""}
                  {item.gap}
                </p>
              </div>
              <details className="group border-border mt-5 border-t pt-4">
                <DisclosureSummary
                  closedLabel="編集フォームを開く"
                  openLabel="編集フォームを閉じる"
                  icon={<Pencil className="size-4" />}
                  className="text-sm"
                />
                <div className="mt-5">
                  <IdealForm categories={categories} item={item} />
                  <form action={deleteIdealAction} className="mt-4">
                    <input type="hidden" name="idealItemId" value={item.id} />
                    <Button type="submit" variant="destructive">
                      理想の持ち物を削除
                    </Button>
                  </form>
                </div>
              </details>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
