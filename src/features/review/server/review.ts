import "server-only";

import { getCategories } from "@/features/categories/server/categories";
import { attachCategories } from "@/features/items/server/items";
import { requireUserId } from "@/lib/auth";

export async function getReviewQueue(sessionId: string) {
  const authContext = await requireUserId();
  const { supabase } = authContext;
  const [{ data, error }, categories] = await Promise.all([
    supabase.rpc("get_review_queue", {
      p_session_id: sessionId,
      p_limit: 500,
    }),
    getCategories(authContext),
  ]);
  if (error) throw new Error("見直し対象を読み込めませんでした。");
  return attachCategories(data, categories);
}

export async function getReviewSummary(sessionId: string) {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("item_reviews")
    .select("decision")
    .eq("user_id", userId)
    .eq("review_session_id", sessionId);
  if (error) throw new Error("見直し履歴を読み込めませんでした。");
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
