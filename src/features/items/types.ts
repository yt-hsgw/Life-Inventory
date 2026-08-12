import type {
  Category,
  ItemRow,
  SubCategory,
} from "@/types/database.generated";

export const ITEM_STATUSES = ["KEEP", "MAYBE", "RELEASE"] as const;
export const ITEM_STATUS_LABELS = {
  KEEP: "残す",
  MAYBE: "迷っている",
  RELEASE: "手放す",
} as const;

export type ItemView = ItemRow & {
  category: Pick<Category, "id" | "name">;
  subCategory: Pick<SubCategory, "id" | "name"> | null;
};
