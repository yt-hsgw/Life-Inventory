import type { Metadata } from "next";
import {
  ArrowRight,
  CreditCard,
  ListChecks,
  Package,
  Target,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getDashboard } from "@/features/dashboard/server/dashboard";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "インベントリ" };

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-bold tracking-[0.14em]">
        {label}
      </p>
      <p className={`font-numeric mt-2 text-4xl ${accent ? "text-primary" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const data = await getDashboard();
  const maxCategory = Math.max(
    ...data.categoryCounts.map((category) => category.quantity),
    1,
  );
  return (
    <>
      <PageHeader
        eyebrow="暮らしの全体像"
        title="インベントリ"
        description="今の状態と理想との差を、判断を急がずに見渡します。"
      />
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-7 sm:p-9">
          <div className="grid gap-8 sm:grid-cols-3">
            <Metric label="今の持ち物" value={data.currentItems} />
            <Metric label="理想の持ち物" value={data.idealItems} accent />
            <Metric
              label="差"
              value={`${data.gap > 0 ? "+" : ""}${data.gap}`}
            />
          </div>
          <div className="border-border mt-9 border-t pt-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-2xl">カテゴリ別</h2>
              <Link
                href="/items"
                className="text-primary text-xs font-semibold"
              >
                持ち物を見る
              </Link>
            </div>
            <div className="space-y-4">
              {data.categoryCounts.map((category) => (
                <div
                  key={category.id}
                  className="grid grid-cols-[2rem_1fr_3rem] items-center gap-3"
                >
                  <span className="text-sm font-semibold">{category.name}</span>
                  <div className="bg-secondary h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{
                        width: `${Math.max((category.quantity / maxCategory) * 100, category.quantity ? 4 : 0)}%`,
                      }}
                    />
                  </div>
                  <span className="font-numeric text-right text-sm">
                    {category.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <div className="grid gap-5">
          <Link href="/review" className="group">
            <Card className="group-hover:bg-secondary/60 h-full transition-colors">
              <div className="flex items-start justify-between">
                <ListChecks className="text-primary size-5" />
                <ArrowRight className="text-muted-foreground size-4" />
              </div>
              <p className="font-numeric mt-7 text-3xl font-semibold">{data.reviewCount}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                件の持ち物が見直し待ち
              </p>
            </Card>
          </Link>
          <Link href="/items?status=RELEASE" className="group">
            <Card className="group-hover:bg-secondary/60 h-full transition-colors">
              <div className="flex items-start justify-between">
                <Package className="text-destructive size-5" />
                <ArrowRight className="text-muted-foreground size-4" />
              </div>
              <p className="font-numeric mt-7 text-3xl font-semibold">{data.releaseCount}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                個の持ち物を手放す予定
              </p>
            </Card>
          </Link>
        </div>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Link href="/ideal" className="group">
          <Card className="group-hover:bg-secondary/60 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
              <span className="bg-secondary grid size-11 place-items-center rounded-full">
                <Target className="text-primary size-5" />
              </span>
              <div>
                <p className="text-muted-foreground text-xs">
                  今と理想
                </p>
                <p className="mt-1 font-semibold">差を見直す</p>
              </div>
            </div>
            <ArrowRight className="size-4" />
          </Card>
        </Link>
        <Link href="/expenses" className="group">
          <Card className="group-hover:bg-secondary/60 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
              <span className="bg-secondary grid size-11 place-items-center rounded-full">
                <CreditCard className="text-primary size-5" />
              </span>
              <div>
                <p className="text-muted-foreground text-xs">固定費</p>
                <p className="font-numeric mt-1 font-semibold">
                  {formatCurrency(Math.round(data.expenses.monthly))}{" "}
                  <span className="text-muted-foreground text-xs font-normal">
                    / 月
                  </span>
                </p>
                <p className="font-numeric text-muted-foreground mt-1 text-xs">
                  {formatCurrency(Math.round(data.expenses.annual))} / 年
                </p>
              </div>
            </div>
            <ArrowRight className="size-4" />
          </Card>
        </Link>
      </div>
    </>
  );
}
