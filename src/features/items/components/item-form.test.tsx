import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ItemForm } from "@/features/items/components/item-form";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import type { CategoryWithSubs } from "@/features/categories/server/categories";
import type { ItemRow } from "@/types/database.generated";

const useActionStateMock = vi.hoisted(() => vi.fn());

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: useActionStateMock };
});

vi.mock("@/features/items/actions", () => ({ saveItemAction: vi.fn() }));

const categories: CategoryWithSubs[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "user-1",
    name: "仕事",
    sort_order: 0,
    created_at: "2026-08-13T00:00:00Z",
    updated_at: "2026-08-13T00:00:00Z",
    subCategories: [],
  },
];

const item: ItemRow = {
  id: "22222222-2222-4222-8222-222222222222",
  user_id: "user-1",
  category_id: categories[0].id,
  sub_category_id: null,
  name: "ノートPC",
  quantity: 1,
  color: null,
  size: null,
  purpose: null,
  product_url: null,
  purchase_price: null,
  purchased_at: null,
  last_used_at: null,
  status: "KEEP",
  review_requested: false,
  memo: null,
  archived_at: null,
  release_reason: null,
  created_at: "2026-08-13T00:00:00Z",
  updated_at: "2026-08-13T00:00:00Z",
};

describe("ItemForm", () => {
  beforeEach(() => {
    useActionStateMock.mockReset();
    useActionStateMock.mockReturnValue([INITIAL_ACTION_STATE, vi.fn(), false]);
  });

  it("詳細情報の編集時に任意項目の目的と入力例を示す", () => {
    render(<ItemForm categories={categories} item={item} />);

    expect(
      screen.getByText(
        "すべて任意です。分かる範囲だけ入力し、あとから更新できます。",
      ),
    ).toBeVisible();

    const sizeInput = screen.getByRole("textbox", { name: "サイズ" });
    expect(sizeInput).toHaveAttribute("aria-describedby", "size-description");
    expect(screen.getByText("例：M、27cm、幅120 × 奥行60cm")).toBeVisible();

    const productUrlInput = screen.getByRole("textbox", {
      name: "商品ページURL",
    });
    expect(productUrlInput).toHaveAttribute(
      "aria-describedby",
      "productUrl-description",
    );
    expect(
      screen.getByText(
        "商品を確認できる http:// または https:// のURLを入力します。",
      ),
    ).toBeVisible();

    expect(
      screen.getByText(
        "オンにすると見直し対象へ追加します。「迷っている」はオフでも対象です。",
      ),
    ).toBeVisible();
  });
});
