import type { Metadata } from "next";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getArchivedItems } from "@/features/items/server/items";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Archive" };

export default async function ArchivePage() {
  const items = await getArchivedItems();
  return (
    <>
      <PageHeader
        eyebrow="HISTORY"
        title="Archive"
        description="手放した物も、これまでの暮らしの記録として残します。"
      />
      {items.length === 0 ? (
        <EmptyState
          title="Archiveはまだ空です"
          description="ItemをArchiveすると、ここに履歴が残ります。"
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <h2 className="font-semibold">
                  {item.name}{" "}
                  <span className="text-muted-foreground text-sm font-normal">
                    × {item.quantity}
                  </span>
                </h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  {item.category.name} · {formatDate(item.archived_at)}
                </p>
                {item.release_reason ? (
                  <p className="mt-3 text-sm">{item.release_reason}</p>
                ) : null}
              </div>
              <p className="text-sm font-semibold">
                {item.purchase_price === null
                  ? "—"
                  : formatCurrency(item.purchase_price)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
