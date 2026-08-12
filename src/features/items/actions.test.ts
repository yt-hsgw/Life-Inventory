import { beforeEach, describe, expect, it, vi } from "vitest";
import { setReviewRequestedAction } from "@/features/items/actions";

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

    await setReviewRequestedAction(formData);

    expect(mocks.update).toHaveBeenCalledWith({ review_requested: expected });
    expect(mocks.eq).toHaveBeenCalledWith("id", ITEM_ID);
    expect(mocks.eq).toHaveBeenCalledWith("user_id", USER_ID);
    expect(mocks.is).toHaveBeenCalledWith("archived_at", null);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/review");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/items/${ITEM_ID}`);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("rejects an unsupported review flag before authentication", async () => {
    const formData = new FormData();
    formData.set("itemId", ITEM_ID);
    formData.set("reviewRequested", "on");

    await setReviewRequestedAction(formData);

    expect(mocks.requireUserId).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
