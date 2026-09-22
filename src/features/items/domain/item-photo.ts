import { z } from "zod";

export const ITEM_PHOTO_BUCKET = "item-photos";
export const ITEM_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const ITEM_PHOTO_MAX_COUNT = 10;
export const ITEM_PHOTO_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ItemPhotoContentType = (typeof ITEM_PHOTO_CONTENT_TYPES)[number];

export const photoDraftIdsSchema = z
  .array(z.string().uuid("写真の識別子が正しくありません。"))
  .max(ITEM_PHOTO_MAX_COUNT, `写真は${ITEM_PHOTO_MAX_COUNT}枚までです。`)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "同じ写真が重複しています。",
  })
  .default([]);

export const photoDraftDeleteSchema = z.object({
  draftId: z.string().uuid(),
});

export type UploadedItemPhotoDraft = {
  id: string;
  previewUrl: string;
  contentType: ItemPhotoContentType;
  sizeBytes: number;
};

export function isSupportedPhotoContentType(
  value: string,
): value is ItemPhotoContentType {
  return ITEM_PHOTO_CONTENT_TYPES.includes(value as ItemPhotoContentType);
}

export function detectPhotoContentType(
  bytes: Uint8Array,
): ItemPhotoContentType | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (
    bytes.length >= pngSignature.length &&
    pngSignature.every((value, index) => bytes[index] === value)
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export function getPhotoExtension(contentType: ItemPhotoContentType) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  return "webp";
}
