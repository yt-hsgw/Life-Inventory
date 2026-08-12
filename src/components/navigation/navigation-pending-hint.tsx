"use client";

import { LoaderCircle } from "lucide-react";
import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

export function NavigationPendingHint({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <>
      <span
        data-testid="navigation-pending-hint"
        aria-hidden="true"
        className={cn(
          "ml-auto grid size-4 shrink-0 place-items-center transition-opacity",
          pending ? "opacity-100" : "opacity-0",
          className,
        )}
      >
        <LoaderCircle className="size-3.5 animate-spin" />
      </span>
      <span className="sr-only" role="status" aria-live="polite">
        {pending ? "移動中" : ""}
      </span>
    </>
  );
}
