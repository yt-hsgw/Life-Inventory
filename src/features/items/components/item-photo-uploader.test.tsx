import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { ItemPhotoUploader } from "@/features/items/components/item-photo-uploader";

describe("ItemPhotoUploader", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("offers camera capture on mobile and multiple image selection", () => {
    render(<ItemPhotoUploader onAnalysis={vi.fn()} />);

    const cameraInput = screen.getByLabelText<HTMLInputElement>("写真を撮る");
    const uploadInput = screen.getByLabelText<HTMLInputElement>("画像を選ぶ");
    expect(cameraInput).toHaveAttribute("capture", "environment");
    expect(uploadInput).toHaveAttribute("multiple");
    expect(uploadInput).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/webp",
    );
    expect(cameraInput.labels?.[0]).toHaveClass(
      "peer-focus-visible/camera:ring-2",
    );
    expect(uploadInput.labels?.[0]).toHaveClass(
      "peer-focus-visible/upload:ring-2",
    );
  });

  it("keeps the draft and analyzes it only after explicit confirmation", async () => {
    const onAnalysis = vi.fn();
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            draft: {
              id: "393be301-edf2-4d1a-9388-c91777abe329",
              previewUrl:
                "https://example.supabase.co/storage/v1/object/sign/item-photos/photo.png?token=test",
              contentType: "image/png",
              sizeBytes: 8,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "ready",
            data: {
              name: "マグカップ",
              categoryName: "食",
              subCategoryName: null,
              colorHex: null,
              size: null,
              purpose: null,
              memo: null,
              confidence: 0.9,
              uncertainFields: [],
              warnings: ["一部が影で隠れています"],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    const { container } = render(<ItemPhotoUploader onAnalysis={onAnalysis} />);
    const file = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      "item.png",
      { type: "image/png" },
    );

    fireEvent.change(screen.getByLabelText("画像を選ぶ"), {
      target: { files: [file] },
    });

    await waitFor(() =>
      expect(
        container.querySelector<HTMLInputElement>('input[name="photoDraftIds"]')
          ?.value,
      ).toBe("393be301-edf2-4d1a-9388-c91777abe329"),
    );
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(onAnalysis).not.toHaveBeenCalled();
    expect(
      screen.getByText(/最初に追加した写真をOpenAIへ送信します/),
    ).toHaveTextContent("位置情報（EXIF）、人物、住居内の情報");

    fireEvent.click(screen.getByRole("button", { name: "写真から自動入力" }));

    await waitFor(() => expect(onAnalysis).toHaveBeenCalledTimes(1));
    const hiddenInput = container.querySelector<HTMLInputElement>(
      'input[name="photoDraftIds"]',
    );
    expect(hiddenInput?.value).toBe("393be301-edf2-4d1a-9388-c91777abe329");
    expect(screen.getByText("代表")).toBeVisible();
    expect(screen.getByText(/AIの確信度：90%/)).toHaveTextContent(
      "注意：一部が影で隠れています",
    );
  });

  it("shows analysis failures as an error without discarding the photo", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            draft: {
              id: "393be301-edf2-4d1a-9388-c91777abe329",
              previewUrl:
                "https://example.supabase.co/storage/v1/object/sign/item-photos/photo.png?token=test",
              contentType: "image/png",
              sizeBytes: 8,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "failed",
            message: "自動入力に失敗しました。手入力を続けられます。",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    const { container } = render(<ItemPhotoUploader onAnalysis={vi.fn()} />);
    const file = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      "item.png",
      { type: "image/png" },
    );

    fireEvent.change(screen.getByLabelText("画像を選ぶ"), {
      target: { files: [file] },
    });
    await screen.findByRole("button", { name: "写真から自動入力" });
    fireEvent.click(screen.getByRole("button", { name: "写真から自動入力" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "自動入力に失敗しました。手入力を続けられます。",
    );
    expect(
      container.querySelector('input[name="photoDraftIds"]'),
    ).toBeInTheDocument();
  });

  it("locks photo operations and notifies the parent while AI is running", async () => {
    let resolveAnalysis: (response: Response) => void = () => undefined;
    const pendingAnalysis = new Promise<Response>((resolve) => {
      resolveAnalysis = resolve;
    });
    const onBusyChange = vi.fn();
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            draft: {
              id: "393be301-edf2-4d1a-9388-c91777abe329",
              previewUrl:
                "https://example.supabase.co/storage/v1/object/sign/item-photos/photo.png?token=test",
              contentType: "image/png",
              sizeBytes: 8,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockReturnValueOnce(pendingAnalysis);
    render(
      <ItemPhotoUploader onAnalysis={vi.fn()} onBusyChange={onBusyChange} />,
    );
    const file = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      "item.png",
      { type: "image/png" },
    );

    fireEvent.change(screen.getByLabelText("画像を選ぶ"), {
      target: { files: [file] },
    });
    await screen.findByRole("button", { name: "写真から自動入力" });
    fireEvent.click(screen.getByRole("button", { name: "写真から自動入力" }));

    expect(screen.getByLabelText("画像を選ぶ")).toBeDisabled();
    expect(screen.getByLabelText("写真1を削除")).toBeDisabled();
    expect(screen.getByRole("button", { name: "自動入力中…" })).toBeDisabled();
    expect(onBusyChange).toHaveBeenLastCalledWith(true);

    resolveAnalysis(
      new Response(
        JSON.stringify({
          status: "unavailable",
          message: "自動入力は現在利用できません。手入力を続けられます。",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(false));
  });

  it("does not mark an added draft as representative when photos already exist", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          draft: {
            id: "493be301-edf2-4d1a-9388-c91777abe329",
            previewUrl:
              "https://example.supabase.co/storage/v1/object/sign/item-photos/photo.png?token=test",
            contentType: "image/png",
            sizeBytes: 8,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    render(<ItemPhotoUploader existingCount={1} onAnalysis={vi.fn()} />);
    const file = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      "item.png",
      { type: "image/png" },
    );

    fireEvent.change(screen.getByLabelText("画像を選ぶ"), {
      target: { files: [file] },
    });

    await screen.findByRole("img", { name: "持ち物の写真 1" });
    expect(screen.queryByText("代表")).not.toBeInTheDocument();
  });
});
