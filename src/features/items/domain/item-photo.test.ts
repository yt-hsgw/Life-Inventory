import { describe, expect, it } from "vitest";
import {
  detectPhotoContentType,
  photoDraftIdsSchema,
} from "@/features/items/domain/item-photo";

describe("item photo", () => {
  it.each([
    [[0xff, 0xd8, 0xff, 0x00], "image/jpeg"],
    [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "image/png"],
    [
      [
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42,
        0x50,
      ],
      "image/webp",
    ],
  ])("detects supported binary signatures", (input, expected) => {
    expect(detectPhotoContentType(Uint8Array.from(input as number[]))).toBe(
      expected,
    );
  });

  it("rejects a spoofed or unknown binary signature", () => {
    expect(detectPhotoContentType(Uint8Array.from([0x47, 0x49, 0x46]))).toBeNull();
  });

  it("allows at most ten photo drafts", () => {
    const ids = Array.from(
      { length: 11 },
      (_, index) => `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    );

    expect(photoDraftIdsSchema.safeParse(ids).success).toBe(false);
  });
});
