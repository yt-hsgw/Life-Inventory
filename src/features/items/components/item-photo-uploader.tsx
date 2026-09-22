"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ImagePlus,
  LoaderCircle,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ItemPhotoAnalysis } from "@/features/items/domain/item-photo-analysis";
import {
  ITEM_PHOTO_CONTENT_TYPES,
  ITEM_PHOTO_MAX_BYTES,
  ITEM_PHOTO_MAX_COUNT,
  type UploadedItemPhotoDraft,
} from "@/features/items/domain/item-photo";
import { cn } from "@/lib/utils";

type UploadResponse = {
  draft?: UploadedItemPhotoDraft;
  message?: string;
};

type AnalysisResponse =
  | { status: "ready"; data: ItemPhotoAnalysis }
  | { status: "unavailable" | "failed"; message: string };

export function ItemPhotoUploader({
  existingCount = 0,
  onAnalysis,
  onBusyChange,
}: {
  existingCount?: number;
  onAnalysis: (analysis: ItemPhotoAnalysis) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const uploadInputId = useId();
  const cameraInputId = useId();
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const operationBusyRef = useRef(false);
  const [drafts, setDrafts] = useState<UploadedItemPhotoDraft[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [analysisDetails, setAnalysisDetails] = useState<{
    confidence: number;
    warnings: string[];
  }>();
  const isOperationBusy = isBusy || isAnalyzing;

  function setBusy(value: boolean) {
    operationBusyRef.current = value;
    setIsBusy(value);
    onBusyChange?.(value);
  }

  async function analyzeDraft(draftId: string) {
    if (operationBusyRef.current) return;
    operationBusyRef.current = true;
    setIsAnalyzing(true);
    onBusyChange?.(true);
    setError(undefined);
    setAnalysisDetails(undefined);
    setMessage("写真から入力候補を作成中…");
    try {
      const response = await fetch("/api/item-photo-drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      const result = (await response.json()) as AnalysisResponse & {
        message?: string;
      };
      if (!response.ok) throw new Error(result.message);
      if (result.status === "ready") {
        onAnalysis(result.data);
        setAnalysisDetails({
          confidence: result.data.confidence,
          warnings: result.data.warnings,
        });
        setMessage(
          "自動入力の候補を反映しました。内容を確認してから保存してください。",
        );
      } else if (result.status === "failed") {
        setMessage(undefined);
        setError(result.message);
      } else {
        setMessage(result.message);
      }
    } catch (cause) {
      setMessage(undefined);
      setError(
        cause instanceof Error && cause.message
          ? cause.message
          : "自動入力に失敗しました。手入力を続けられます。",
      );
    } finally {
      operationBusyRef.current = false;
      setIsAnalyzing(false);
      onBusyChange?.(false);
    }
  }

  async function uploadFiles(files: File[]) {
    if (operationBusyRef.current) return;
    setError(undefined);
    setMessage(undefined);
    setAnalysisDetails(undefined);

    const remaining = ITEM_PHOTO_MAX_COUNT - existingCount - drafts.length;
    if (remaining <= 0) {
      setError(`写真は${ITEM_PHOTO_MAX_COUNT}枚までです。`);
      return;
    }

    const selected = files.slice(0, remaining);
    const invalid = selected.find(
      (file) =>
        !ITEM_PHOTO_CONTENT_TYPES.includes(
          file.type as (typeof ITEM_PHOTO_CONTENT_TYPES)[number],
        ) ||
        file.size <= 0 ||
        file.size > ITEM_PHOTO_MAX_BYTES,
    );
    if (invalid) {
      setError("JPEG・PNG・WebPの画像を選び、1枚あたり5MB以下にしてください。");
      return;
    }

    setBusy(true);
    const uploaded: UploadedItemPhotoDraft[] = [];

    try {
      for (const [index, file] of selected.entries()) {
        setMessage(`写真をアップロード中… ${index + 1}/${selected.length}`);
        const body = new FormData();
        body.set("photo", file);
        const response = await fetch("/api/item-photo-drafts", {
          method: "POST",
          body,
        });
        const result = (await response.json()) as UploadResponse;
        if (!response.ok || !result.draft) {
          throw new Error(result.message ?? "写真を追加できませんでした。");
        }
        const uploadedDraft = result.draft;
        uploaded.push(uploadedDraft);
        setDrafts((current) => [...current, uploadedDraft]);
      }

      let latestMessage = "写真を追加しました。";
      if (files.length > remaining) {
        latestMessage += ` 上限の${ITEM_PHOTO_MAX_COUNT}枚まで追加しました。`;
      }
      setMessage(latestMessage);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "写真を追加できませんでした。",
      );
      setMessage(
        uploaded.length > 0
          ? `${uploaded.length}枚は追加済みです。失敗した写真だけ選び直してください。`
          : undefined,
      );
    } finally {
      setBusy(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  }

  async function removeDraft(draftId: string) {
    if (operationBusyRef.current) return;
    operationBusyRef.current = true;
    setBusy(true);
    setError(undefined);
    const previous = drafts;
    setDrafts((current) => current.filter((draft) => draft.id !== draftId));

    try {
      const response = await fetch(
        `/api/item-photo-drafts?draftId=${encodeURIComponent(draftId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error();
      setMessage("写真を削除しました。");
    } catch {
      setDrafts(previous);
      setError("写真を削除できませんでした。時間をおいて再度お試しください。");
    } finally {
      setBusy(false);
    }
  }

  function moveDraft(index: number, direction: -1 | 1) {
    if (operationBusyRef.current) return;
    setDrafts((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }

  return (
    <section className="border-border bg-card rounded-3xl border p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <ImagePlus className="size-5" aria-hidden="true" />
            写真から追加
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            写真を起点に入力できます。自動入力された内容は保存前に確認してください。
          </p>
        </div>
        <p className="text-muted-foreground text-xs">
          {existingCount + drafts.length}/{ITEM_PHOTO_MAX_COUNT}枚
        </p>
      </div>

      {drafts.map((draft) => (
        <input
          key={`hidden-${draft.id}`}
          type="hidden"
          name="photoDraftIds"
          value={draft.id}
        />
      ))}

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          ref={cameraInputRef}
          id={cameraInputId}
          className="peer/camera sr-only"
          type="file"
          accept={ITEM_PHOTO_CONTENT_TYPES.join(",")}
          capture="environment"
          disabled={
            isOperationBusy ||
            existingCount + drafts.length >= ITEM_PHOTO_MAX_COUNT
          }
          onChange={(event) =>
            void uploadFiles(Array.from(event.currentTarget.files ?? []))
          }
        />
        <label
          htmlFor={cameraInputId}
          className={cn(
            buttonVariants(),
            "peer-focus-visible/camera:ring-ring cursor-pointer peer-focus-visible/camera:ring-2 peer-focus-visible/camera:ring-offset-2 peer-focus-visible/camera:outline-none sm:hidden",
          )}
          aria-disabled={
            isOperationBusy ||
            existingCount + drafts.length >= ITEM_PHOTO_MAX_COUNT
          }
        >
          <Camera className="size-4" aria-hidden="true" />
          写真を撮る
        </label>
        <input
          ref={uploadInputRef}
          id={uploadInputId}
          className="peer/upload sr-only"
          type="file"
          accept={ITEM_PHOTO_CONTENT_TYPES.join(",")}
          multiple
          disabled={
            isOperationBusy ||
            existingCount + drafts.length >= ITEM_PHOTO_MAX_COUNT
          }
          onChange={(event) =>
            void uploadFiles(Array.from(event.currentTarget.files ?? []))
          }
        />
        <label
          htmlFor={uploadInputId}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "peer-focus-visible/upload:ring-ring cursor-pointer peer-focus-visible/upload:ring-2 peer-focus-visible/upload:ring-offset-2 peer-focus-visible/upload:outline-none",
          )}
          aria-disabled={
            isOperationBusy ||
            existingCount + drafts.length >= ITEM_PHOTO_MAX_COUNT
          }
        >
          <Upload className="size-4" aria-hidden="true" />
          画像を選ぶ
        </label>
      </div>

      <div
        className={cn(
          "border-input mt-4 hidden min-h-28 items-center justify-center rounded-2xl border border-dashed p-5 text-center transition-colors sm:flex",
          isDragging && "border-primary bg-secondary/70",
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!isOperationBusy)
            void uploadFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <div className="text-muted-foreground text-sm">
          <Upload className="mx-auto mb-2 size-5" aria-hidden="true" />
          ここに画像をドラッグ＆ドロップ
          <span className="mt-1 block text-xs">
            JPEG・PNG・WebP / 1枚5MBまで
          </span>
        </div>
      </div>

      {drafts.length > 0 ? (
        <div
          className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          aria-label="追加する写真"
        >
          {drafts.map((draft, index) => (
            <div key={draft.id} className="space-y-2">
              <div className="border-border bg-secondary relative aspect-square overflow-hidden rounded-2xl border">
                <Image
                  src={draft.previewUrl}
                  alt={`持ち物の写真 ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 12rem"
                  className="object-cover"
                />
                {existingCount === 0 && index === 0 ? (
                  <span className="bg-primary text-primary-foreground absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.625rem] font-bold">
                    <Star className="size-3" aria-hidden="true" />
                    代表
                  </span>
                ) : null}
              </div>
              <div className="flex justify-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-9 px-0"
                  disabled={index === 0 || isOperationBusy}
                  aria-label={`写真${index + 1}を前へ移動`}
                  onClick={() => moveDraft(index, -1)}
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-9 px-0"
                  disabled={index === drafts.length - 1 || isOperationBusy}
                  aria-label={`写真${index + 1}を後ろへ移動`}
                  onClick={() => moveDraft(index, 1)}
                >
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive size-9 px-0"
                  disabled={isOperationBusy}
                  aria-label={`写真${index + 1}を削除`}
                  onClick={() => void removeDraft(draft.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {drafts[0] ? (
        <div className="border-border bg-secondary/60 mt-4 rounded-2xl border p-4">
          <p
            id="photo-analysis-privacy"
            className="text-muted-foreground text-xs leading-5"
          >
            実行すると最初に追加した写真をOpenAIへ送信します。写真には位置情報（EXIF）、人物、住居内の情報が含まれる場合があります。生成結果は候補として反映されるため、保存前に必ず確認・修正してください。
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            disabled={isOperationBusy}
            aria-describedby="photo-analysis-privacy"
            onClick={() => void analyzeDraft(drafts[0].id)}
          >
            {isAnalyzing ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Sparkles className="size-4" aria-hidden="true" />
            )}
            {isAnalyzing ? "自動入力中…" : "写真から自動入力"}
          </Button>
        </div>
      ) : null}

      {existingCount > 0 ? (
        <p className="text-muted-foreground mt-3 text-xs">
          登録済みの写真{existingCount}枚に、新しい写真を追加します。
        </p>
      ) : null}

      <div className="mt-3 min-h-5 text-xs" aria-live="polite">
        {isOperationBusy ? (
          <p className="text-muted-foreground flex items-center gap-2">
            <LoaderCircle
              className="size-3.5 animate-spin"
              aria-hidden="true"
            />
            {message ?? "写真を処理中…"}
          </p>
        ) : error ? (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        ) : message ? (
          <div className="space-y-1">
            <p className="text-success">{message}</p>
            {analysisDetails ? (
              <p className="text-muted-foreground">
                AIの確信度：{Math.round(analysisDetails.confidence * 100)}%
                {analysisDetails.warnings.length > 0
                  ? `／注意：${analysisDetails.warnings.join("・")}`
                  : ""}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground">
            写真なしでも登録できます。撮影画像には位置情報が含まれる場合があります。
          </p>
        )}
      </div>
    </section>
  );
}
