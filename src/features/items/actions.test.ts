import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  setReviewRequestedAction,
  updateItemStatusAction,
} from "@/features/items/actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";

const mocks = vi.hoisted(() => ({
  eq: vi.fn(),
  from: vi.fn(),
  is: vi.fn(),
  requireUserId: vi.fn(),
  revalidatePath: vi.fn(),
  update: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireUserId: mocks.requireUserId }));

const ITEM_ID = "393be301-edf2-4d1a-9388-c91777abe329";
const USER_ID = "0923aca8-14a9-40d2-9828-c4911df07a73";

describe("setReviewRequestedAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const query = {
      update: mocks.update,
      eq: mocks.eq,
      is: mocks.is,
    };
    mocks.from.mockReturnValue(query);
    mocks.update.mockReturnValue(query);
    mocks.eq.mockReturnValue(query);
    mocks.is.mockResolvedValue({ error: null });
    mocks.requireUserId.mockResolvedValue({
      supabase: { from: mocks.from },
      userId: USER_ID,
    });
  });

  it.each([
    ["true", true],
    ["false", false],
  ])("sets the explicit review flag from %s", async (input, expected) => {
    const formData = new FormData();
    formData.set("itemId", ITEM_ID);
    formData.set("reviewRequested", input);

    const result = await setReviewRequestedAction(
      INITIAL_ACTION_STATE,
      formData,
    );

    expect(mocks.update).toHaveBeenCalledWith({ review_requested: expected });
    expect(mocks.eq).toHaveBeenCalledWith("id", ITEM_ID);
    expect(mocks.eq).toHaveBeenCalledWith("user_id", USER_ID);
    expect(mocks.is).toHaveBeenCalledWith("archived_at", null);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/review");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/items/${ITEM_ID}`);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(result).toEqual(INITIAL_ACTION_STATE);
  });

  it("rejects an unsupported review flag before authentication", async () => {
    const formData = new FormData();
    formData.set("itemId", ITEM_ID);
    formData.set("reviewRequested", "on");

    const result = await setReviewRequestedAction(
      INITIAL_ACTION_STATE,
      formData,
    );

    expect(mocks.requireUserId).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "error",
      message: "見直しの入力が正しくありません。",
    });
  });

  it("returns a retryable error without revalidating when status update fails", async () => {
    mocks.is.mockResolvedValue({ error: new Error("database detail") });
    const formData = new FormData();
    formData.set("itemId", ITEM_ID);
    formData.set("status", "MAYBE");

    const result = await updateItemStatusAction(INITIAL_ACTION_STATE, formData);

    expect(result).toEqual({
      status: "error",
      message: "状態を更新できませんでした。",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
