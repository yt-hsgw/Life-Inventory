import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DisclosureSummary } from "@/components/ui/disclosure-summary";
import { deleteExpenseAction } from "@/features/expenses/actions";
import { monthlyEquivalent } from "@/features/expenses/domain/calculate-expenses";
import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { getExpenses } from "@/features/expenses/server/expenses";
import { EXPENSE_CATEGORY_LABELS } from "@/features/expenses/types";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "固定費" };

export default async function ExpensesPage() {
  const { expenses, totals } = await getExpenses();
  const groups = Map.groupBy(expenses, (expense) => expense.category);
  return (
    <>
      <PageHeader
        eyebrow="定期的な支出"
        title="固定費"
        description="変動費ではなく、暮らしに定期的に流れる固定費だけを見渡します。"
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="text-muted-foreground text-xs">月額</p>
          <p className="font-numeric text-primary mt-2 text-3xl font-semibold">
            {formatCurrency(Math.round(totals.monthly))}
          </p>
        </Card>
        <Card>
          <p className="text-muted-foreground text-xs">年額</p>
          <p className="font-numeric mt-2 text-3xl font-semibold">
            {formatCurrency(Math.round(totals.annual))}
          </p>
        </Card>
      </div>
      <Card className="mb-5">
        <details className="group">
          <DisclosureSummary
            closedLabel="固定費の入力欄を開く"
            openLabel="固定費の入力欄を閉じる"
          />
          <div className="mt-6">
            <ExpenseForm />
          </div>
        </details>
      </Card>
      {expenses.length === 0 ? (
        <EmptyState
          title="固定費はまだありません"
          description="毎月・毎年の支出を登録すると、生活コストを一覧できます。"
        />
      ) : (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([category, list]) => (
            <section key={category}>
              <h2 className="text-muted-foreground mb-3 text-xs font-bold tracking-[0.16em]">
                {EXPENSE_CATEGORY_LABELS[category].toUpperCase()}
              </h2>
              <div className="divide-border border-border bg-card divide-y overflow-hidden rounded-3xl border">
                {list.map((expense) => (
                  <div key={expense.id} className="p-5">
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <h3 className="font-semibold">{expense.name}</h3>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {expense.billing_cycle === "MONTHLY"
                            ? "毎月"
                            : `毎年${expense.billing_month ? `${expense.billing_month}月` : ""}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-numeric font-semibold">
                          {formatCurrency(expense.amount)}{" "}
                          <span className="text-muted-foreground text-xs font-normal">
                            /{" "}
                            {expense.billing_cycle === "MONTHLY"
                              ? "月"
                              : "年"}
                          </span>
                        </p>
                        {expense.billing_cycle === "YEARLY" ? (
                          <p className="font-numeric text-muted-foreground mt-1 text-xs">
                            月額換算{" "}
                            {formatCurrency(
                              Math.round(
                                monthlyEquivalent(
                                  expense.amount,
                                  expense.billing_cycle,
                                ),
                              ),
                            )}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <details className="group border-border mt-4 border-t pt-3">
                      <DisclosureSummary
                        closedLabel="編集・削除を開く"
                        openLabel="編集・削除を閉じる"
                        icon={<Pencil className="size-3.5" />}
                        className="text-xs"
                      />
                      <div className="mt-5">
                        <ExpenseForm expense={expense} />
                        <form action={deleteExpenseAction} className="mt-4">
                          <input
                            type="hidden"
                            name="expenseId"
                            value={expense.id}
                          />
                          <Button type="submit" variant="destructive">
                            固定費を削除
                          </Button>
                        </form>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
