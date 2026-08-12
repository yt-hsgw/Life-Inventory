import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItemList } from "@/features/items/components/item-list";

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
});
