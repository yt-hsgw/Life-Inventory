import { z } from "zod";
import {
  ITEM_COLOR_HEX_PATTERN,
  normalizeItemColor,
} from "@/features/items/domain/item-color";
import { ITEM_STATUSES } from "@/features/items/types";

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(max).optional(),
  );
const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(0).max(1_000_000_000).optional(),
);
const optionalDate = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.iso.date().optional(),
);
const optionalColor = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  if (value.trim() === "") return undefined;
  return normalizeItemColor(value) ?? value;
}, z.string().regex(ITEM_COLOR_HEX_PATTERN, "16進カラー（例: #2563EB）で入力してください。").optional());
const optionalUrl = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z
    .url("httpまたはhttpsのURLを入力してください。")
    .max(2048)
    .refine(
      (value) => ["http:", "https:"].includes(new URL(value).protocol),
      "httpまたはhttpsのURLを入力してください。",
    )
    .optional(),
);

export const itemSchema = z.object({
  itemId: z.string().uuid().optional().or(z.literal("")),
  name: z
    .string()
    .trim()
    .min(1, "名前を入力してください。")
    .max(100, "100文字以内で入力してください。"),
  categoryId: z.string().uuid("カテゴリを選んでください。"),
  subCategoryId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().uuid().optional(),
  ),
  quantity: z.coerce
    .number()
    .int("整数で入力してください。")
    .min(1, "1以上で入力してください。")
    .max(1_000_000),
  color: optionalColor,
  size: optionalText(50),
  purpose: optionalText(255),
  productUrl: optionalUrl,
  purchasePrice: optionalNumber,
  purchasedAt: optionalDate,
  lastUsedAt: optionalDate,
  status: z.enum(ITEM_STATUSES).default("KEEP"),
  reviewRequested: z.preprocess(
    (value) => value === "on" || value === "true",
    z.boolean(),
  ),
  memo: optionalText(5000),
});

export const itemListQuerySchema = z.object({
  q: z.string().trim().max(100).catch(""),
  category: z.string().uuid().or(z.literal("")).catch(""),
  status: z.enum(ITEM_STATUSES).or(z.literal("")).catch(""),
});
