import { describe, expect, it } from "vitest";
import { itemSchema } from "@/features/items/schemas/item-schema";

const requiredItem = {
  name: "マグカップ",
  categoryId: "b98ea7c6-17d4-40ae-8431-1731920fd187",
  quantity: "1",
  status: "KEEP",
};

describe("item schema", () => {
  it("normalizes a valid color before persistence", () => {
    const result = itemSchema.parse({ ...requiredItem, color: "abc" });

    expect(result.color).toBe("#AABBCC");
  });

  it("rejects an invalid CSS-like color string", () => {
    const result = itemSchema.safeParse({
      ...requiredItem,
      color: "url(javascript:alert(1))",
    });

    expect(result.success).toBe(false);
  });

  it("keeps duplicate form fields as an ordered photo draft list", () => {
    const photoDraftIds = [
      "393be301-edf2-4d1a-9388-c91777abe329",
      "0923aca8-14a9-40d2-9828-c4911df07a73",
    ];
    const result = itemSchema.parse({ ...requiredItem, photoDraftIds });

    expect(result.photoDraftIds).toEqual(photoDraftIds);
  });
});
