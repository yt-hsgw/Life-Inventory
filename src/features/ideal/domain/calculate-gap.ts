export type GapDirection = "REDUCE" | "ADD" | "MATCHED";

export function calculateGap(currentQuantity: number, targetQuantity: number) {
  return targetQuantity - currentQuantity;
}

export function getGapDirection(gap: number): GapDirection {
  if (gap < 0) return "REDUCE";
  if (gap > 0) return "ADD";
  return "MATCHED";
}
