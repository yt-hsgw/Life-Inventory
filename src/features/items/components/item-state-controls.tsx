"use client";

import { useActionState } from "react";
import { ListPlus, ListX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  setReviewRequestedAction,
  updateItemStatusAction,
} from "@/features/items/actions";
import { ITEM_STATUS_LABELS } from "@/features/items/types";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import type { ItemStatus } from "@/types/database.generated";

export function ItemStateControls({
  itemId,
  status,
  reviewRequested,
}: {
  itemId: string;
  status: ItemStatus;
  reviewRequested: boolean;
}) {
  const [statusState, statusAction, statusPending] = useActionState(
    updateItemStatusAction,
    INITIAL_ACTION_STATE,
  );
  const [reviewState, reviewAction, reviewPending] = useActionState(
    setReviewRequestedAction,
    INITIAL_ACTION_STATE,
  );
  const busy = statusPending || reviewPending;

  return (
    <div aria-busy={busy}>
      <p className="text-muted-foreground text-xs font-bold tracking-wide">
        状態
      </p>
      <Badge className="mt-3">{ITEM_STATUS_LABELS[status]}</Badge>
      <form action={statusAction} className="mt-5 space-y-3">
        <input type="hidden" name="itemId" value={itemId} />
        <select
          name="status"
          defaultValue={status}
          aria-label="状態を変更"
          disabled={busy}
        >
          <option value="KEEP">残す</option>
          <option value="MAYBE">迷っている</option>
          <option value="RELEASE">手放す</option>
        </select>
        <SubmitButton
          variant="outline"
          className="w-full"
          disabled={busy}
          pendingLabel="状態を更新中…"
        >
          状態を更新
        </SubmitButton>
      </form>
      {statusState.message ? (
        <p className="text-destructive mt-2 text-sm" role="alert">
          {statusState.message}
        </p>
      ) : null}
      <form action={reviewAction} className="mt-3">
        <input type="hidden" name="itemId" value={itemId} />
        <input
          type="hidden"
          name="reviewRequested"
          value={String(!reviewRequested)}
        />
        <SubmitButton
          variant="ghost"
          className="w-full"
          disabled={busy}
          pendingLabel={reviewRequested ? "見直しを解除中…" : "見直しに追加中…"}
        >
          {reviewRequested ? (
            <ListX className="size-4" aria-hidden="true" />
          ) : (
            <ListPlus className="size-4" aria-hidden="true" />
          )}
          {reviewRequested ? "見直しを解除" : "見直しに追加"}
        </SubmitButton>
      </form>
      {reviewState.message ? (
        <p className="text-destructive mt-2 text-sm" role="alert">
          {reviewState.message}
        </p>
      ) : null}
      {status === "MAYBE" ? (
        <p className="text-muted-foreground mt-2 text-xs leading-5">
          状態が「迷っている」の間は、依頼を解除しても見直し対象です。
        </p>
      ) : null}
    </div>
  );
}
