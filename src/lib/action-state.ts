export type ActionState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const INITIAL_ACTION_STATE: ActionState = { status: "idle" };

export function invalidAction(
  errors: Record<string, string[] | undefined>,
): ActionState {
  return {
    status: "error",
    message: "入力内容を確認してください。",
    errors: Object.fromEntries(
      Object.entries(errors).filter((entry): entry is [string, string[]] =>
        Boolean(entry[1]),
      ),
    ),
  };
}

export function failedAction(message = "保存できませんでした。"): ActionState {
  return { status: "error", message };
}
