import { ArchiveX, CirclePause, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { reviewItemAction } from "@/features/review/actions";
import type { ItemView } from "@/features/items/types";
import { formatDate } from "@/lib/utils";

export function ReviewCard({
  item,
  remaining,
}: {
  item: ItemView;
  remaining: number;
}) {
  return (
    <Card className="mx-auto max-w-2xl p-7 sm:p-10">
      <div className="text-muted-foreground flex items-center justify-between text-xs font-bold tracking-[0.16em]">
        <span>REVIEW</span>
        <span>{remaining} ITEMS LEFT</span>
      </div>
      <div className="my-10 text-center">
        <p className="text-muted-foreground text-sm">
          {item.category.name}
          {item.subCategory ? ` / ${item.subCategory.name}` : ""}
        </p>
        <h2 className="mt-3 font-serif text-4xl leading-tight">{item.name}</h2>
        <div className="mt-6 flex justify-center gap-8 text-sm">
          <p>
            <span className="text-muted-foreground block text-xs">数量</span>
            <strong className="mt-1 block text-xl">{item.quantity}</strong>
          </p>
          <p>
            <span className="text-muted-foreground block text-xs">
              最後に使用
            </span>
            <strong className="mt-1 block text-base">
              {formatDate(item.last_used_at)}
            </strong>
          </p>
        </div>
      </div>
      <form action={reviewItemAction} className="border-border border-t pt-7">
        <input type="hidden" name="itemId" value={item.id} />
        <label
          htmlFor="review-memo"
          className="text-muted-foreground text-xs font-bold tracking-wide"
        >
          今回のメモ（任意）
        </label>
        <Textarea
          id="review-memo"
          name="memo"
          className="mt-2"
          maxLength={1000}
        />
        <p className="mt-7 text-center font-serif text-2xl">
          このアイテムをどうしますか？
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Button type="submit" name="decision" value="KEEP">
            <Heart className="size-4" />
            残す
          </Button>
          <Button type="submit" name="decision" value="MAYBE" variant="outline">
            <CirclePause className="size-4" />
            保留
          </Button>
          <Button
            type="submit"
            name="decision"
            value="RELEASE"
            variant="destructive"
          >
            <ArchiveX className="size-4" />
            手放す
          </Button>
        </div>
      </form>
    </Card>
  );
}
