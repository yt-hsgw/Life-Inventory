import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";

const useActionStateMock = vi.hoisted(() => vi.fn());

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: useActionStateMock };
});

vi.mock("@/features/expenses/actions", () => ({ saveExpenseAction: vi.fn() }));

describe("ExpenseForm", () => {
  beforeEach(() => {
    useActionStateMock.mockReturnValue([INITIAL_ACTION_STATE, vi.fn(), false]);
  });

  it("金額と周期を取り違えないための入力ヒントを表示する", () => {
    render(<ExpenseForm />);

    expect(
      screen.getByText("選んだ支払い周期1回分の金額を円単位で入力します。"),
    ).toBeVisible();
    expect(
      screen.getByText("毎月の支払いか、年1回の支払いかを選びます。"),
    ).toBeVisible();
    expect(
      screen.getByText("更新日、解約条件、契約先などを残せます。"),
    ).toBeVisible();
  });
});
