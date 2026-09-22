import "server-only";

import type { CategoryWithSubs } from "@/features/categories/server/categories";
import type { ItemPhotoAnalysisResult } from "@/features/items/domain/item-photo-analysis";
import { analyzeItemPhotoCore } from "@/features/items/server/photo-analysis-core";

export async function analyzeItemPhoto({
  file,
  categories,
}: {
  file: File;
  categories: CategoryWithSubs[];
}): Promise<ItemPhotoAnalysisResult> {
  return analyzeItemPhotoCore({ file, categories });
}
