import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ItemStateControls } from "@/features/items/components/item-state-controls";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";

const useActionStateMock = vi.hoisted(() => vi.fn());

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: useActionStateMock };
});

vi.mock("@/features/items/actions", () => ({
  setReviewRequestedAction: vi.fn(),
  updateItemStatusAction: vi.fn(),
}));

describe("ItemStateControls", () => {
  beforeEach(() => {
    useActionStateMock.mockReset();
  });

  it("一方の更新中は競合する状態・見直し操作をすべて無効化する", () => {
    useActionStateMock
      .mockReturnValueOnce([INITIAL_ACTION_STATE, vi.fn(), true])
      .mockReturnValueOnce([INITIAL_ACTION_STATE, vi.fn(), false]);

    render(
      <ItemStateControls
        itemId="393be301-edf2-4d1a-9388-c91777abe329"
        status="KEEP"
        reviewRequested={false}
      />,
    );

    expect(screen.getByRole("combobox", { name: "状態を変更" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "状態を更新" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "見直しに追加" })).toBeDisabled();
  });

  it("更新失敗を対象操作の近くに表示する", () => {
    useActionStateMock
      .mockReturnValueOnce([
        { status: "error", message: "状態を更新できませんでした。" },
        vi.fn(),
        false,
      ])
      .mockReturnValueOnce([INITIAL_ACTION_STATE, vi.fn(), false]);

    render(
      <ItemStateControls
        itemId="393be301-edf2-4d1a-9388-c91777abe329"
        status="KEEP"
        reviewRequested={false}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "状態を更新できませんでした。",
    );
  });
});
