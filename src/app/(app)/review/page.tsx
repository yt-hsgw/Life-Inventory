import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewCard } from "@/features/review/components/review-card";
import {
  getRecentReviewSummary,
  getReviewQueue,
} from "@/features/review/server/review";

export const metadata: Metadata = { title: "Review" };

export default async function ReviewPage() {
  const [queue, summary] = await Promise.all([
    getReviewQueue(),
    getRecentReviewSummary(),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="REVIEW FIRST"
        title="Review"
        description="1つずつ、自分にとっての役割を静かに見直します。"
      />
      {queue[0] ? (
        <ReviewCard item={queue[0]} remaining={queue.length} />
      ) : (
        <EmptyState
          title="Review Complete"
          description="今、判断を待っているItemはありません。必要になったらItem詳細からReviewへ追加できます。"
          action={
            <Link
              href="/items"
              className={buttonVariants({ variant: "outline" })}
            >
              Itemsを見る
            </Link>
          }
        />
      )}
      {summary.total > 0 ? (
        <Card className="mx-auto mt-5 grid max-w-2xl grid-cols-4 text-center">
          <div>
            <p className="text-2xl font-semibold">{summary.total}</p>
            <p className="text-muted-foreground text-xs">Today</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{summary.keep}</p>
            <p className="text-muted-foreground text-xs">Keep</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{summary.maybe}</p>
            <p className="text-muted-foreground text-xs">Maybe</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{summary.release}</p>
            <p className="text-muted-foreground text-xs">Release</p>
          </div>
        </Card>
      ) : null}
    </>
  );
}
