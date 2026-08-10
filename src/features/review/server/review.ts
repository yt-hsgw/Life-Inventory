import "server-only";

import { isReviewTarget } from "@/features/items/domain/item-metrics";
import { getItems } from "@/features/items/server/items";
import { requireUserId } from "@/lib/auth";

export async function getReviewQueue() {
  const { items } = await getItems();
  return items.filter(isReviewTarget);
}

export async function getRecentReviewSummary() {
  const { supabase, userId } = await requireUserId();
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from("item_reviews")
    .select("decision")
    .eq("user_id", userId)
    .gte("reviewed_at", since.toISOString());
  if (error) throw new Error("Review履歴を読み込めませんでした。");
  return data.reduce(
    (summary, review) => ({
      ...summary,
      total: summary.total + 1,
      [review.decision.toLowerCase()]:
        summary[review.decision.toLowerCase() as "keep" | "maybe" | "release"] +
        1,
    }),
    { total: 0, keep: 0, maybe: 0, release: 0 },
  );
}
