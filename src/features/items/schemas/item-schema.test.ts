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
});
