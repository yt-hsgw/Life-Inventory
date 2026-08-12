export const ITEM_COLOR_PRESETS = [
  { name: "黒", value: "#111827" },
  { name: "白", value: "#FFFFFF" },
  { name: "グレー", value: "#6B7280" },
  { name: "赤", value: "#DC2626" },
  { name: "オレンジ", value: "#EA580C" },
  { name: "黄", value: "#EAB308" },
  { name: "緑", value: "#16A34A" },
  { name: "青", value: "#2563EB" },
  { name: "紫", value: "#7C3AED" },
  { name: "ピンク", value: "#DB2777" },
  { name: "茶", value: "#92400E" },
] as const;

export const ITEM_COLOR_HEX_PATTERN = /^#[0-9A-F]{6}$/;

export function normalizeItemColor(value: string | null | undefined) {
  const candidate = value?.trim().toUpperCase();
  if (!candidate) return null;
  const withHash = candidate.startsWith("#") ? candidate : `#${candidate}`;
  const expanded = /^#[0-9A-F]{3}$/.test(withHash)
    ? `#${[...withHash.slice(1)].map((character) => character.repeat(2)).join("")}`
    : withHash;
  return ITEM_COLOR_HEX_PATTERN.test(expanded) ? expanded : null;
}

export function getItemColorPresentation(value: string | null | undefined) {
  if (!value) return { hex: null, label: "—", legacy: false } as const;
  const hex = normalizeItemColor(value);
  if (!hex) return { hex: null, label: value, legacy: true } as const;
  const preset = ITEM_COLOR_PRESETS.find(
    (candidate) => candidate.value === hex,
  );
  return {
    hex,
    label: `${preset?.name ?? "カスタム"} ${hex}`,
    legacy: false,
  } as const;
}
