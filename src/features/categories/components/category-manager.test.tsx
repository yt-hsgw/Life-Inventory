import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryManager } from "@/features/categories/components/category-manager";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import type { CategoryWithSubs } from "@/features/categories/server/categories";

const useActionStateMock = vi.hoisted(() => vi.fn());

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: useActionStateMock };
});

vi.mock("@/features/categories/actions", () => ({
  saveCategoryAction: vi.fn(),
  saveSubCategoryAction: vi.fn(),
}));

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

describe("CategoryManager", () => {
  beforeEach(() => {
    useActionStateMock.mockReturnValue([INITIAL_ACTION_STATE, vi.fn(), false]);
  });

  it("カテゴリ編集の影響とサブカテゴリの用途を説明する", () => {
    render(<CategoryManager categories={categories} />);

    expect(
      screen.getByText(
        "名前を変えると、持ち物一覧のカテゴリ表示も変わります。",
      ),
    ).toBeVisible();
    expect(
      screen.getByText("同じカテゴリ内をさらに細かく整理するときに使います。"),
    ).toBeVisible();
  });
});
