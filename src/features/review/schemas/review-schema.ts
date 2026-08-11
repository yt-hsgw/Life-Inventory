import { z } from "zod";

export const reviewSessionSchema = z.string().uuid();

export const reviewSchema = z.object({
  itemId: z.string().uuid(),
  decision: z.enum(["KEEP", "MAYBE", "RELEASE"]),
  sessionId: reviewSessionSchema,
  memo: z.string().trim().max(1000).optional(),
});
