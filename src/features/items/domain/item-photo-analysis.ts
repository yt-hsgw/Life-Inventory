import { z } from "zod";
import { ITEM_COLOR_HEX_PATTERN } from "@/features/items/domain/item-color";

export const itemPhotoAnalysisSchema = z
  .object({
    name: z.string().trim().min(1).max(100).nullable(),
    categoryName: z.string().trim().min(1).max(50).nullable(),
    subCategoryName: z.string().trim().min(1).max(50).nullable(),
    colorHex: z.string().regex(ITEM_COLOR_HEX_PATTERN).nullable(),
    size: z.string().trim().min(1).max(50).nullable(),
    purpose: z.string().trim().min(1).max(255).nullable(),
    memo: z.string().trim().min(1).max(500).nullable(),
    confidence: z.number().min(0).max(1),
    uncertainFields: z
      .array(
        z.enum([
          "name",
          "categoryName",
          "subCategoryName",
          "colorHex",
          "size",
          "purpose",
          "memo",
        ]),
      )
      .max(7),
    warnings: z.array(z.string().trim().min(1).max(200)).max(5),
  })
  .strict();

export type ItemPhotoAnalysis = z.infer<typeof itemPhotoAnalysisSchema>;

export type ItemPhotoAnalysisResult =
  | { status: "ready"; data: ItemPhotoAnalysis }
  | {
      status: "unavailable";
      reason?: "not_configured";
      message: string;
    }
  | {
      status: "failed";
      reason?: "invalid_file" | "provider_error" | "invalid_response";
      message: string;
    };
