import { z } from "zod";

export const idealSchema = z.object({
  idealItemId: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "名前を入力してください。").max(100),
  categoryId: z.string().uuid("カテゴリを選んでください。"),
  subCategoryId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().uuid().optional(),
  ),
  targetQuantity: z.coerce
    .number()
    .int()
    .min(0, "0以上で入力してください。")
    .max(1_000_000),
  estimatedPrice: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number().int().min(0).max(1_000_000_000).optional(),
  ),
  priority: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  ),
  memo: z.string().trim().max(5000).optional(),
});
