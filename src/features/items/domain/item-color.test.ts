import { describe, expect, it } from "vitest";
import {
  getItemColorPresentation,
  ITEM_COLOR_PRESETS,
  normalizeItemColor,
} from "@/features/items/domain/item-color";

describe("item color", () => {
  it("provides named presets including black, white, and blue", () => {
    expect(ITEM_COLOR_PRESETS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "黒" }),
        expect.objectContaining({ name: "白" }),
        expect.objectContaining({ name: "青" }),
      ]),
    );
  });

  it("normalizes three and six digit hexadecimal input", () => {
    expect(normalizeItemColor("fff")).toBe("#FFFFFF");
    expect(normalizeItemColor("#1a2b3c")).toBe("#1A2B3C");
    expect(normalizeItemColor("  ")).toBeNull();
    expect(normalizeItemColor("blue")).toBeNull();
  });

  it("formats preset, custom, legacy, and unset values safely", () => {
    expect(getItemColorPresentation("#2563eb")).toEqual({
      hex: "#2563EB",
      label: "青 #2563EB",
      legacy: false,
    });
    expect(getItemColorPresentation("#123456")).toEqual({
      hex: "#123456",
      label: "カスタム #123456",
      legacy: false,
    });
    expect(getItemColorPresentation("紺色")).toEqual({
      hex: null,
      label: "紺色",
      legacy: true,
    });
    expect(getItemColorPresentation(null)).toEqual({
      hex: null,
      label: "—",
      legacy: false,
    });
  });
});
