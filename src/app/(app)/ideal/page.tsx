import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { IdealForm } from "@/features/ideal/components/ideal-form";
import { deleteIdealAction } from "@/features/ideal/actions";
import { getIdealComparisons } from "@/features/ideal/server/ideal";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Ideal" };

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
        eyebrow="CURRENT VS IDEAL"
        title="Ideal"
        description="減らすことだけでなく、必要なものを足すことも同じように見渡します。"
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-muted-foreground text-xs">CURRENT</p>
          <p className="mt-2 text-3xl font-semibold">{currentTotal}</p>
        </Card>
        <Card>
          <p className="text-muted-foreground text-xs">IDEAL</p>
          <p className="text-primary mt-2 text-3xl font-semibold">
            {targetTotal}
          </p>
        </Card>
        <Card>
          <p className="text-muted-foreground text-xs">GAP</p>
          <p className="mt-2 text-3xl font-semibold">
            {targetTotal - currentTotal > 0 ? "+" : ""}
            {targetTotal - currentTotal}
          </p>
        </Card>
      </div>
      <Card className="mb-5">
        <details>
          <summary className="focus-visible:ring-primary cursor-pointer font-semibold focus-visible:ring-2 focus-visible:outline-none">
            + Ideal Itemを追加
          </summary>
          <div className="mt-6">
            <IdealForm categories={categories} />
          </div>
        </details>
      </Card>
      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Ideal filter">
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
              ? "All"
              : value === "REDUCE"
                ? "Reduce"
                : value === "ADD"
                  ? "Add"
                  : "Matched"}
          </Link>
        ))}
      </nav>
      {comparisons.length === 0 ? (
        <EmptyState
          title="Idealを描いてみましょう"
          description="理想の数量を決めると、Currentとの差がここに現れます。"
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
                <p className="text-sm tabular-nums">
                  <strong>{item.currentQuantity}</strong>{" "}
                  <span className="text-muted-foreground mx-2">→</span>{" "}
                  <strong>{item.target_quantity}</strong>
                </p>
                <p
                  className={cn(
                    "min-w-16 text-right text-xl font-semibold",
                    item.gap < 0 && "text-warning",
                    item.gap > 0 && "text-primary",
                  )}
                >
                  {item.gap > 0 ? "+" : ""}
                  {item.gap}
                </p>
              </div>
              <details className="border-border mt-5 border-t pt-4">
                <summary className="focus-visible:ring-primary cursor-pointer text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none">
                  編集
                </summary>
                <div className="mt-5">
                  <IdealForm categories={categories} item={item} />
                  <form action={deleteIdealAction} className="mt-4">
                    <input type="hidden" name="idealItemId" value={item.id} />
                    <Button type="submit" variant="destructive">
                      Idealを削除
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
