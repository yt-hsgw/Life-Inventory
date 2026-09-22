import { ITEM_PHOTO_BUCKET } from "@/features/items/domain/item-photo";
import { getItemPhotoCleanupSecret } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const CLEANUP_BATCH_SIZE = 50;

async function digest(value: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

async function isAuthorized(request: Request, expected: string) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;
  const actual = authorization.slice("Bearer ".length);
  const [actualDigest, expectedDigest] = await Promise.all([
    digest(actual),
    digest(expected),
  ]);
  let difference = 0;
  for (let index = 0; index < expectedDigest.length; index += 1) {
    difference |= actualDigest[index] ^ expectedDigest[index];
  }
  return difference === 0;
}

/**
 * Cloudflare Cron等から呼ぶ、期限切れ写真Draftの回収境界。
 * service roleとcleanup secretはserver側だけで保持する。
 */
export async function POST(request: Request) {
  const secret = getItemPhotoCleanupSecret();
  if (!secret) {
    return Response.json(
      { message: "写真の定期削除が設定されていません。" },
      { status: 503 },
    );
  }
  if (!(await isAuthorized(request, secret))) {
    return Response.json({ message: "認証に失敗しました。" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: expired, error: queueError } = await admin.rpc(
    "queue_expired_item_photo_drafts",
    { p_limit: CLEANUP_BATCH_SIZE },
  );
  if (queueError) {
    return Response.json(
      { message: "期限切れ写真を回収キューへ追加できませんでした。" },
      { status: 500 },
    );
  }

  const { data: retryQueue, error: claimError } = await admin.rpc(
    "claim_item_photo_deletion_queue",
    { p_limit: CLEANUP_BATCH_SIZE },
  );
  if (claimError) {
    return Response.json(
      { message: "写真の削除キューを取得できませんでした。" },
      { status: 500 },
    );
  }

  const paths = [
    ...new Set(
      [...(expired ?? []), ...(retryQueue ?? [])].map(
        (entry) => entry.storage_path,
      ),
    ),
  ].slice(0, CLEANUP_BATCH_SIZE);
  let deleted = 0;

  for (const storagePath of paths) {
    const { error: storageError } = await admin.storage
      .from(ITEM_PHOTO_BUCKET)
      .remove([storagePath]);
    if (storageError) continue;

    const { error: completeError } = await admin.rpc(
      "complete_item_photo_deletion",
      { p_storage_path: storagePath },
    );
    if (!completeError) deleted += 1;
  }

  return Response.json({ queued: paths.length, deleted });
}
