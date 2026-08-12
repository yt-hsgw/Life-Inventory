"use client";

import { ArchiveX, CirclePause, Heart } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function ReviewDecisionButtons() {
  const { pending } = useFormStatus();
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <Button
        type="submit"
        name="decision"
        value="KEEP"
        disabled={pending}
        aria-disabled={pending}
      >
        <Heart className="size-4" />
        残す
      </Button>
      <Button
        type="submit"
        name="decision"
        value="MAYBE"
        variant="outline"
        disabled={pending}
        aria-disabled={pending}
      >
        <CirclePause className="size-4" />
        保留
      </Button>
      <Button
        type="submit"
        name="decision"
        value="RELEASE"
        variant="destructive"
        disabled={pending}
        aria-disabled={pending}
      >
        <ArchiveX className="size-4" />
        手放す
      </Button>
      {pending ? (
        <p className="text-muted-foreground text-center text-sm sm:col-span-3">
          判断を保存しています…
        </p>
      ) : null}
    </div>
  );
}
