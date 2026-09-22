import type {
  Category,
  ItemRow,
  SubCategory,
} from "@/types/database.generated";
import type { ItemPhotoRow } from "@/types/database.generated";

export const ITEM_STATUSES = ["KEEP", "MAYBE", "RELEASE"] as const;
export const ITEM_STATUS_LABELS = {
  KEEP: "残す",
  MAYBE: "迷っている",
  RELEASE: "手放す",
} as const;

export type ItemView = ItemRow & {
  category: Pick<Category, "id" | "name">;
  subCategory: Pick<SubCategory, "id" | "name"> | null;
  photos: ItemPhotoView[];
  coverPhoto: ItemPhotoView | null;
};

export type ItemPhotoView = Pick<
  ItemPhotoRow,
  "id" | "item_id" | "display_order" | "content_type" | "size_bytes"
> & {
  url: string;
};
