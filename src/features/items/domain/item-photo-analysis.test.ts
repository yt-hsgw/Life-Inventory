import { describe, expect, it } from "vitest";
import { itemPhotoAnalysisSchema } from "@/features/items/domain/item-photo-analysis";

const validAnalysis = {
  name: "青いマグカップ",
  categoryName: "食",
  subCategoryName: "食器",
  colorHex: "#2563EB",
  size: null,
  purpose: "飲み物を入れる",
  memo: null,
  confidence: 0.92,
  uncertainFields: ["size", "memo"],
  warnings: [],
};

describe("itemPhotoAnalysisSchema", () => {
  it("accepts a bounded structured analysis", () => {
    expect(itemPhotoAnalysisSchema.parse(validAnalysis)).toEqual(validAnalysis);
  });

  it("rejects extra fields and invalid confidence", () => {
    expect(
      itemPhotoAnalysisSchema.safeParse({
        ...validAnalysis,
        confidence: 1.1,
        productUrl: "https://example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects color values outside the canonical uppercase hex format", () => {
    expect(
      itemPhotoAnalysisSchema.safeParse({
        ...validAnalysis,
        colorHex: "#2563eb",
      }).success,
    ).toBe(false);
  });
});
