import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewCard } from "@/features/review/components/review-card";
import { reviewSessionSchema } from "@/features/review/schemas/review-schema";
import {
  getReviewQueue,
  getReviewSummary,
} from "@/features/review/server/review";

export const metadata: Metadata = { title: "見直し" };

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const parsedSession = reviewSessionSchema.safeParse(
    (await searchParams).session,
  );
  if (!parsedSession.success) {
    redirect(`/review?session=${randomUUID()}`);
  }

  const [queue, summary] = await Promise.all([
    getReviewQueue(parsedSession.data),
    getReviewSummary(parsedSession.data),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="ひとつずつ見直す"
        title="見直し"
        description="1つずつ、自分にとっての役割を静かに見直します。"
      />
      {queue[0] ? (
        <ReviewCard
          item={queue[0]}
          remaining={queue.length}
          sessionId={parsedSession.data}
        />
      ) : (
        <EmptyState
          title="見直しが完了しました"
          description="今、判断を待っている持ち物はありません。必要になったら持ち物の詳細から見直しへ追加できます。"
          action={
            <Link
              href="/items"
              className={buttonVariants({ variant: "outline" })}
            >
              持ち物を見る
            </Link>
          }
        />
      )}
      {summary.total > 0 ? (
        <Card className="mx-auto mt-5 grid max-w-2xl grid-cols-4 text-center">
          <div>
            <p className="font-numeric text-2xl font-semibold">{summary.total}</p>
            <p className="text-muted-foreground text-xs">今回</p>
          </div>
          <div>
            <p className="font-numeric text-2xl font-semibold">{summary.keep}</p>
            <p className="text-muted-foreground text-xs">残す</p>
          </div>
          <div>
            <p className="font-numeric text-2xl font-semibold">{summary.maybe}</p>
            <p className="text-muted-foreground text-xs">保留</p>
          </div>
          <div>
            <p className="font-numeric text-2xl font-semibold">{summary.release}</p>
            <p className="text-muted-foreground text-xs">手放す</p>
          </div>
        </Card>
      ) : null}
    </>
  );
}
