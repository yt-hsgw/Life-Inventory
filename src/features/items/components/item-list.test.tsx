import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItemList } from "@/features/items/components/item-list";
import type { ItemView } from "@/features/items/types";

const item: ItemView = {
  id: "22222222-2222-4222-8222-222222222222",
  user_id: "user-1",
  category_id: "11111111-1111-4111-8111-111111111111",
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
  category: {
    id: "11111111-1111-4111-8111-111111111111",
    name: "仕事",
  },
  subCategory: null,
  photos: [],
  coverPhoto: {
    id: "33333333-3333-4333-8333-333333333333",
    item_id: "22222222-2222-4222-8222-222222222222",
    display_order: 0,
    content_type: "image/png",
    size_bytes: 8,
    url: "https://example.supabase.co/photo.png",
  },
};

describe("ItemList", () => {
  it("本文幅が狭いタブレットでは絞り込みを縦に並べる", () => {
    render(
      <ItemList
        items={[]}
        categories={[]}
        filters={{ q: "", category: "", status: "" }}
      />,
    );

    expect(screen.getByRole("form", { name: "持ち物を絞り込む" })).toHaveClass(
      "xl:grid-cols-[minmax(0,1fr)_13rem_11rem_auto]",
    );
  });

  it("mobileでも代表写真を表示する", () => {
    const { container } = render(
      <ItemList
        items={[item]}
        categories={[]}
        filters={{ q: "", category: "", status: "" }}
      />,
    );

    const thumbnail = container.querySelector("img")?.parentElement;
    expect(thumbnail).not.toHaveClass("hidden");
    expect(thumbnail).toHaveClass("size-14", "sm:size-16");
  });
});
