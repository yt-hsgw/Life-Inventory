import { getItemColorPresentation } from "@/features/items/domain/item-color";
import { cn } from "@/lib/utils";

export function ItemColorDisplay({
  value,
  compact = false,
}: {
  value: string | null | undefined;
  compact?: boolean;
}) {
  const color = getItemColorPresentation(value);
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {color.hex ? (
        <span
          aria-hidden="true"
          className="border-border size-3.5 shrink-0 rounded-[0.2rem] border shadow-sm"
          style={{ backgroundColor: color.hex }}
        />
      ) : null}
      <span className={cn(compact && "truncate text-xs")}>{color.label}</span>
    </span>
  );
}
