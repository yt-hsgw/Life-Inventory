import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DisclosureSummary({
  closedLabel,
  openLabel,
  icon,
  className,
}: {
  closedLabel: string;
  openLabel: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <summary
      className={cn(
        "focus-visible:ring-primary flex min-h-11 cursor-pointer items-center gap-2 rounded-xl font-semibold focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      {icon}
      <span className="group-open:hidden">{closedLabel}</span>
      <span className="hidden group-open:inline">{openLabel}</span>
      <ChevronDown className="ml-auto size-4 shrink-0 transition-transform group-open:rotate-180" />
    </summary>
  );
}
