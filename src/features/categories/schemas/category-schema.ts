import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z
    .string()
    .trim()
    .min(1, "名前を入力してください。")
    .max(50, "50文字以内で入力してください。"),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
});

export const subCategorySchema = categorySchema.extend({
  categoryId: z.string().uuid("カテゴリを選んでください。"),
});
