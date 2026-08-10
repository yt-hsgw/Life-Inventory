import { z } from "zod";
import { EXPENSE_CATEGORIES } from "@/features/expenses/types";

export const expenseSchema = z.object({
  expenseId: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "名前を入力してください。").max(100),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.coerce
    .number()
    .int()
    .min(0, "0以上で入力してください。")
    .max(1_000_000_000),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  billingMonth: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number().int().min(1).max(12).optional(),
  ),
  memo: z.string().trim().max(5000).optional(),
});
