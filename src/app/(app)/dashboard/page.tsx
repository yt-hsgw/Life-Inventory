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

export const metadata: Metadata = { title: "Dashboard" };

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
      <p className={`mt-2 font-serif text-4xl ${accent ? "text-primary" : ""}`}>
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
        eyebrow="LIFE AT A GLANCE"
        title="Dashboard"
        description="今の状態と理想との差を、判断を急がずに見渡します。"
      />
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-7 sm:p-9">
          <div className="grid gap-8 sm:grid-cols-3">
            <Metric label="CURRENT ITEMS" value={data.currentItems} />
            <Metric label="IDEAL ITEMS" value={data.idealItems} accent />
            <Metric
              label="GAP"
              value={`${data.gap > 0 ? "+" : ""}${data.gap}`}
            />
          </div>
          <div className="border-border mt-9 border-t pt-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-2xl">By category</h2>
              <Link
                href="/items"
                className="text-primary text-xs font-semibold"
              >
                Itemsを見る
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
                  <span className="text-right text-sm tabular-nums">
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
              <p className="mt-7 text-3xl font-semibold">{data.reviewCount}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                items waiting for review
              </p>
            </Card>
          </Link>
          <Link href="/items?status=RELEASE" className="group">
            <Card className="group-hover:bg-secondary/60 h-full transition-colors">
              <div className="flex items-start justify-between">
                <Package className="text-destructive size-5" />
                <ArrowRight className="text-muted-foreground size-4" />
              </div>
              <p className="mt-7 text-3xl font-semibold">{data.releaseCount}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                items to release
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
                  CURRENT VS IDEAL
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
                <p className="text-muted-foreground text-xs">FIXED COST</p>
                <p className="mt-1 font-semibold">
                  {formatCurrency(Math.round(data.expenses.monthly))}{" "}
                  <span className="text-muted-foreground text-xs font-normal">
                    / month
                  </span>
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatCurrency(Math.round(data.expenses.annual))} / year
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
