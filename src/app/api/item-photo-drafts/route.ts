import { getCategories } from "@/features/categories/server/categories";
import {
  detectPhotoContentType,
  getPhotoExtension,
  isSupportedPhotoContentType,
  ITEM_PHOTO_BUCKET,
  ITEM_PHOTO_MAX_BYTES,
  photoDraftDeleteSchema,
} from "@/features/items/domain/item-photo";
import { analyzeItemPhoto } from "@/features/items/server/photo-analysis";
import { isSafeItemPhotoBytes } from "@/features/items/server/photo-analysis-core";
import { itemPhotoAnalysisSchema } from "@/features/items/domain/item-photo-analysis";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.generated";

export const runtime = "nodejs";

const MAX_MULTIPART_BYTES = ITEM_PHOTO_MAX_BYTES + 1024 * 1024;
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

function jsonError(message: string, status: number) {
  return Response.json({ message }, { status });
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === null || origin === new URL(request.url).origin;
}

async function readRequestBodyWithinLimit(request: Request, limit: number) {
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

async function getRouteAuth() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || typeof userId !== "string") return null;
  return { supabase, userId };
}

async function cleanupExpiredDrafts() {
  const admin = createAdminClient();
  const threshold = new Date(Date.now() - DRAFT_TTL_MS).toISOString();
  const { data: expired } = await admin.rpc("queue_expired_item_photo_drafts", {
    p_expired_before: threshold,
    p_limit: 50,
  });
  if (!expired?.length) return;

  for (const entry of expired) {
    const { error } = await admin.storage
      .from(ITEM_PHOTO_BUCKET)
      .remove([entry.storage_path]);
    if (!error) {
      await admin.rpc("complete_item_photo_deletion", {
        p_storage_path: entry.storage_path,
      });
    }
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("許可されていない操作です。", 403);
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BYTES) {
    return jsonError("画像は1枚5MB以下にしてください。", 413);
  }

  const authContext = await getRouteAuth();
  if (!authContext) return jsonError("ログインが必要です。", 401);
  const { supabase, userId } = authContext;
  const admin = createAdminClient();
  await cleanupExpiredDrafts();

  const { count: activeDraftCount, error: countError } = await supabase
    .from("item_photo_drafts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("consumed_item_id", null);
  if (countError)
    return jsonError("写真の登録状況を確認できませんでした。", 500);
  if ((activeDraftCount ?? 0) >= 50) {
    return jsonError(
      "未保存の写真が多すぎます。不要な写真を削除するか、持ち物を保存してください。",
      409,
    );
  }

  const requestBody = await readRequestBodyWithinLimit(
    request,
    MAX_MULTIPART_BYTES,
  );
  if (!requestBody) return jsonError("画像は1枚5MB以下にしてください。", 413);

  let formData: FormData;
  try {
    formData = await new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: requestBody,
    }).formData();
  } catch {
    return jsonError("画像データを読み取れませんでした。", 400);
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size <= 0) {
    return jsonError("画像を1枚選んでください。", 400);
  }
  if (
    photo.size > ITEM_PHOTO_MAX_BYTES ||
    !isSupportedPhotoContentType(photo.type)
  ) {
    return jsonError(
      "JPEG・PNG・WebPの画像を選び、1枚あたり5MB以下にしてください。",
      400,
    );
  }

  const bytes = new Uint8Array(await photo.arrayBuffer());
  const detectedContentType = detectPhotoContentType(bytes);
  if (
    !detectedContentType ||
    detectedContentType !== photo.type ||
    !isSafeItemPhotoBytes(bytes, detectedContentType)
  ) {
    return jsonError("画像形式を確認できませんでした。", 400);
  }

  const draftId = crypto.randomUUID();
  const storagePath = `${userId}/drafts/${draftId}.${getPhotoExtension(
    detectedContentType,
  )}`;
  const { error: uploadError } = await admin.storage
    .from(ITEM_PHOTO_BUCKET)
    .upload(storagePath, new Blob([bytes], { type: detectedContentType }), {
      contentType: detectedContentType,
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) {
    return jsonError("写真をアップロードできませんでした。", 500);
  }

  const { data: draft, error: insertError } = await supabase.rpc(
    "create_item_photo_draft",
    {
      p_storage_path: storagePath,
      p_content_type: detectedContentType,
      p_size_bytes: photo.size,
    },
  );

  if (insertError || !draft) {
    await admin.storage.from(ITEM_PHOTO_BUCKET).remove([storagePath]);
    return jsonError("写真の登録を完了できませんでした。", 500);
  }

  const { data: signed, error: signedUrlError } = await supabase.storage
    .from(ITEM_PHOTO_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);
  if (signedUrlError || !signed?.signedUrl) {
    await supabase.rpc("queue_item_photo_draft_deletion", {
      p_draft_id: draft.id,
    });
    await admin.storage.from(ITEM_PHOTO_BUCKET).remove([storagePath]);
    await admin.rpc("complete_item_photo_deletion", {
      p_storage_path: storagePath,
    });
    return jsonError("写真の表示URLを作成できませんでした。", 500);
  }

  return Response.json({
    draft: {
      id: draft.id,
      previewUrl: signed.signedUrl,
      contentType: draft.content_type,
      sizeBytes: draft.size_bytes,
    },
  });
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return jsonError("許可されていない操作です。", 403);
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 1024) {
    return jsonError("写真の指定が大きすぎます。", 413);
  }
  const authContext = await getRouteAuth();
  if (!authContext) return jsonError("ログインが必要です。", 401);
  const { supabase } = authContext;
  const admin = createAdminClient();

  const requestBody = await readRequestBodyWithinLimit(request, 1024);
  if (!requestBody) return jsonError("写真の指定が大きすぎます。", 413);

  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(requestBody));
  } catch {
    return jsonError("写真の指定が正しくありません。", 400);
  }
  const parsed = photoDraftDeleteSchema.safeParse(body);
  if (!parsed.success) return jsonError("写真の指定が正しくありません。", 400);

  if (
    !process.env.OPENAI_API_KEY?.trim() ||
    !process.env.OPENAI_ITEM_ANALYSIS_MODEL?.trim()
  ) {
    return Response.json({
      status: "unavailable",
      message: "自動入力は現在利用できません。手入力を続けられます。",
    });
  }

  const { data: claims, error: claimError } = await supabase.rpc(
    "claim_item_photo_draft_analysis",
    { p_draft_id: parsed.data.draftId },
  );
  if (claimError) {
    const limited = claimError.message.includes("hourly limit exceeded");
    return jsonError(
      limited
        ? "自動入力の利用上限に達しました。1時間ほど待つか、手入力を続けてください。"
        : "写真を確認できませんでした。",
      limited ? 429 : 500,
    );
  }
  const draft = claims[0];
  if (!draft) return jsonError("写真が見つかりません。", 404);

  const cachedAnalysis = itemPhotoAnalysisSchema.safeParse(draft.analysis);
  if (cachedAnalysis.success) {
    return Response.json({ status: "ready", data: cachedAnalysis.data });
  }
  if (draft.analysis_status === "processing" && !draft.claim_token) {
    return jsonError("自動入力はすでに処理中です。少し待ってから確認してください。", 409);
  }
  if (draft.analysis_status === "failed" || !draft.claim_token) {
    return jsonError(
      "この写真の自動入力回数が上限に達しました。手入力を続けてください。",
      429,
    );
  }

  const { data: photoBlob, error: downloadError } = await supabase.storage
    .from(ITEM_PHOTO_BUCKET)
    .download(draft.storage_path);
  if (downloadError || !photoBlob) {
    await admin.rpc("fail_item_photo_draft_analysis", {
      p_draft_id: draft.draft_id,
      p_claim_token: draft.claim_token,
    });
    return jsonError("写真を自動入力へ送れませんでした。", 500);
  }

  let analysis: Awaited<ReturnType<typeof analyzeItemPhoto>>;
  try {
    const categories = await getCategories(authContext);
    const file = new File(
      [photoBlob],
      `item.${getPhotoExtension(draft.content_type)}`,
      { type: draft.content_type },
    );
    analysis = await analyzeItemPhoto({ file, categories });
  } catch {
    await admin.rpc("fail_item_photo_draft_analysis", {
      p_draft_id: draft.draft_id,
      p_claim_token: draft.claim_token,
    });
    return Response.json({
      status: "failed",
      message: "自動入力に失敗しました。手入力を続けられます。",
    });
  }

  if (analysis.status === "ready") {
    const { error: completeError } = await admin.rpc(
      "complete_item_photo_draft_analysis",
      {
        p_draft_id: draft.draft_id,
        p_claim_token: draft.claim_token,
        p_analysis: analysis.data as unknown as Json,
      },
    );
    if (completeError) {
      return Response.json({
        status: "failed",
        message: "自動入力の保存に失敗しました。手入力を続けられます。",
      });
    }
  } else {
    await admin.rpc("fail_item_photo_draft_analysis", {
      p_draft_id: draft.draft_id,
      p_claim_token: draft.claim_token,
    });
  }
  return Response.json(analysis);
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return jsonError("許可されていない操作です。", 403);
  const authContext = await getRouteAuth();
  if (!authContext) return jsonError("ログインが必要です。", 401);
  const { supabase } = authContext;
  const admin = createAdminClient();

  const parsed = photoDraftDeleteSchema.safeParse({
    draftId: new URL(request.url).searchParams.get("draftId"),
  });
  if (!parsed.success) return jsonError("写真の指定が正しくありません。", 400);

  const { data: queued, error: queueError } = await supabase.rpc(
    "queue_item_photo_draft_deletion",
    { p_draft_id: parsed.data.draftId },
  );
  if (queueError) return jsonError("写真を確認できませんでした。", 404);
  const storagePath = queued[0]?.storage_path;
  if (!storagePath) return jsonError("写真が見つかりません。", 404);

  const { error: storageError } = await admin.storage
    .from(ITEM_PHOTO_BUCKET)
    .remove([storagePath]);
  if (storageError) return jsonError("写真を削除できませんでした。", 500);

  const { error: deleteError } = await admin.rpc(
    "complete_item_photo_deletion",
    { p_storage_path: storagePath },
  );
  if (deleteError)
    return jsonError("写真の削除を完了できませんでした。", 500);

  return new Response(null, { status: 204 });
}
