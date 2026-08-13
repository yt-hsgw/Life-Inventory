import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeItemPhotoCore } from "@/features/items/server/photo-analysis-core";

const categories = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    user_id: "00000000-0000-4000-8000-000000000002",
    name: "食",
    sort_order: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    subCategories: [
      {
        id: "00000000-0000-4000-8000-000000000003",
        user_id: "00000000-0000-4000-8000-000000000002",
        category_id: "00000000-0000-4000-8000-000000000001",
        name: "食器",
        sort_order: 0,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ],
  },
];

const validAnalysis = {
  name: "青いマグカップ",
  categoryName: "食",
  subCategoryName: "食器",
  colorHex: "#2563EB",
  size: null,
  purpose: "飲み物を入れる",
  memo: null,
  confidence: 0.9,
  uncertainFields: ["size", "memo"],
  warnings: [],
};

function imageFile() {
  return new File(
    [
      Uint8Array.from(
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC",
          "base64",
        ),
      ),
    ],
    "item.png",
    { type: "image/png" },
  );
}

function jpegFile() {
  return new File(
    [
      new Uint8Array([
        0xff, 0xd8, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01,
        0x01, 0x11, 0x00, 0xff, 0xd9,
      ]),
    ],
    "item.jpg",
    { type: "image/jpeg" },
  );
}

function webpFile() {
  const bytes = new Uint8Array(30);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  bytes.set([0x16, 0x00, 0x00, 0x00], 4);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  bytes.set([0x56, 0x50, 0x38, 0x58], 12);
  bytes.set([0x0a, 0x00, 0x00, 0x00], 16);
  return new File([bytes], "item.webp", { type: "image/webp" });
}

describe("analyzeItemPhoto", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_ITEM_ANALYSIS_MODEL", "test-vision-model");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns unavailable without both server-side settings", async () => {
    vi.stubEnv("OPENAI_ITEM_ANALYSIS_MODEL", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(
      analyzeItemPhotoCore({ file: imageFile(), categories }),
    ).resolves.toMatchObject({
      status: "unavailable",
      reason: "not_configured",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends a data URL and strict JSON schema, then revalidates output", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          output: [
            {
              type: "message",
              content: [
                { type: "output_text", text: JSON.stringify(validAnalysis) },
              ],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      analyzeItemPhotoCore({ file: imageFile(), categories }),
    ).resolves.toEqual({ status: "ready", data: validAnalysis });

    const [url, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse(String(init?.body));
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(body.input[0].content[1]).toMatchObject({
      type: "input_image",
      detail: "low",
    });
    expect(body.input[0].content[1].image_url).toMatch(
      /^data:image\/png;base64,/,
    );
    expect(body.text.format).toMatchObject({
      type: "json_schema",
      name: "item_photo_analysis",
      strict: true,
    });
    expect(init?.headers).toEqual({
      Authorization: "Bearer test-key",
      "Content-Type": "application/json",
    });
  });

  it.each([
    ["JPEG", jpegFile],
    ["WebP", webpFile],
  ])("accepts bounded %s dimensions", async (_label, createFile) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ output_text: JSON.stringify(validAnalysis) }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await expect(
      analyzeItemPhotoCore({ file: createFile(), categories }),
    ).resolves.toEqual({ status: "ready", data: validAnalysis });
  });

  it("rejects a model category outside the provided category tree", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            ...validAnalysis,
            categoryName: "存在しないカテゴリ",
            subCategoryName: null,
          }),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      analyzeItemPhotoCore({ file: imageFile(), categories }),
    ).resolves.toMatchObject({
      status: "failed",
      reason: "invalid_response",
    });
  });

  it("rejects unsupported files before sending them", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const file = new File(["not an image"], "item.txt", {
      type: "text/plain",
    });

    await expect(
      analyzeItemPhotoCore({ file, categories }),
    ).resolves.toMatchObject({
      status: "failed",
      reason: "invalid_file",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a supported MIME type when the file signature disagrees", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const file = new File(["not an image"], "item.png", {
      type: "image/png",
    });

    await expect(
      analyzeItemPhotoCore({ file, categories }),
    ).resolves.toMatchObject({
      status: "failed",
      reason: "invalid_file",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a corrupt image even when its MIME type and signature match", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const file = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      "broken.png",
      { type: "image/png" },
    );

    await expect(
      analyzeItemPhotoCore({ file, categories }),
    ).resolves.toMatchObject({
      status: "failed",
      reason: "invalid_file",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects an image whose edge exceeds the safe dimension", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const oversizedPng = new Uint8Array(45);
    oversizedPng.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    oversizedPng.set([0x00, 0x00, 0x00, 0x0d], 8);
    oversizedPng.set([0x49, 0x48, 0x44, 0x52], 12);
    oversizedPng.set([0x00, 0x00, 0x20, 0x01], 16);
    oversizedPng.set([0x00, 0x00, 0x00, 0x01], 20);
    oversizedPng.set([0x00, 0x00, 0x00, 0x00], 33);
    oversizedPng.set([0x49, 0x45, 0x4e, 0x44], 37);
    const file = new File([oversizedPng], "wide.png", {
      type: "image/png",
    });

    await expect(
      analyzeItemPhotoCore({ file, categories }),
    ).resolves.toMatchObject({
      status: "failed",
      reason: "invalid_file",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
