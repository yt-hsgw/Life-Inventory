import type { ItemRow } from "@/types/database.generated";

export function countItemQuantity(
  items: Pick<ItemRow, "quantity" | "archived_at">[],
) {
  return items.reduce(
    (total, item) => total + (item.archived_at ? 0 : item.quantity),
    0,
  );
}

export function isReviewTarget(
  item: Pick<ItemRow, "status" | "review_requested" | "archived_at">,
) {
  return (
    !item.archived_at && (item.status === "MAYBE" || item.review_requested)
  );
}
