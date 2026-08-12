import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdealForm } from "@/features/ideal/components/ideal-form";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import type { CategoryWithSubs } from "@/features/categories/server/categories";

const useActionStateMock = vi.hoisted(() => vi.fn());

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: useActionStateMock };
});

vi.mock("@/features/ideal/actions", () => ({ saveIdealAction: vi.fn() }));

const categories: CategoryWithSubs[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "user-1",
    name: "衣",
    sort_order: 0,
    created_at: "2026-08-13T00:00:00Z",
    updated_at: "2026-08-13T00:00:00Z",
    subCategories: [],
  },
];

describe("IdealForm", () => {
  beforeEach(() => {
    useActionStateMock.mockReturnValue([INITIAL_ACTION_STATE, vi.fn(), false]);
  });

  it("判断に必要な最小限の入力ヒントを表示する", () => {
    render(<IdealForm categories={categories} />);

    expect(
      screen.getByText("将来持ちたい数量です。0なら持たない状態を表します。"),
    ).toBeVisible();
    expect(
      screen.getByText("1個あたりの目安を円単位（整数）で入力します。"),
    ).toBeVisible();
    expect(
      screen.getByText("必要な理由や、迎え入れる条件を残せます。"),
    ).toBeVisible();
  });
});
