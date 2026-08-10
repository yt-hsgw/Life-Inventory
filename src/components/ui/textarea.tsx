import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:ring-primary min-h-24 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
