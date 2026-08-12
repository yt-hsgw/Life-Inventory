import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ItemColorField } from "@/features/items/components/item-color-field";

afterEach(cleanup);

describe("ItemColorField", () => {
  it("selects named presets and submits the hexadecimal value", () => {
    render(<ItemColorField />);

    fireEvent.click(screen.getByRole("button", { name: "青 #2563EB" }));

    expect(screen.getByRole("textbox", { name: "16進カラー" })).toHaveValue(
      "#2563EB",
    );
    expect(screen.getByText("青 #2563EB", { selector: "span" })).toBeVisible();
  });

  it("accepts a custom color and allows returning to unset", () => {
    render(<ItemColorField defaultValue="#111827" />);
    const hexInput = screen.getByRole("textbox", { name: "16進カラー" });

    fireEvent.change(hexInput, { target: { value: "#123456" } });
    expect(screen.getByText("カスタム #123456")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "色を未設定にする" }));
    expect(hexInput).toHaveValue("");
    expect(within(screen.getByRole("status")).getByText("—")).toBeVisible();
  });

  it("uses the native color palette as another input method", () => {
    render(<ItemColorField />);

    fireEvent.change(screen.getByLabelText("カラーパレットから色を選ぶ"), {
      target: { value: "#abcdef" },
    });

    expect(screen.getByRole("textbox", { name: "16進カラー" })).toHaveValue(
      "#ABCDEF",
    );
  });

  it("shows invalid hexadecimal input before submission", () => {
    render(<ItemColorField />);
    const hexInput = screen.getByRole("textbox", { name: "16進カラー" });

    fireEvent.change(hexInput, { target: { value: "#12" } });

    expect(hexInput).toHaveAttribute("aria-invalid", "true");
    expect(
      within(screen.getByRole("status")).getByText(
        "16進カラー（例: #2563EB）で入力してください。",
      ),
    ).toBeVisible();
  });
});
