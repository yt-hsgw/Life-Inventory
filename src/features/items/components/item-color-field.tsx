"use client";

import { useState } from "react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ItemColorDisplay } from "@/features/items/components/item-color-display";
import {
  ITEM_COLOR_PRESETS,
  normalizeItemColor,
} from "@/features/items/domain/item-color";
import { cn } from "@/lib/utils";

const FALLBACK_PICKER_COLOR = "#89916B";

export function ItemColorField({
  defaultValue,
  value,
  onValueChange,
  error,
}: {
  defaultValue?: string | null;
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
}) {
  const initialValue = normalizeItemColor(defaultValue) ?? defaultValue ?? "";
  const [internalValue, setInternalValue] = useState(initialValue);
  const inputValue = value ?? internalValue;
  const selectedColor = normalizeItemColor(inputValue);
  const hasInvalidInput = inputValue.trim() !== "" && !selectedColor;

  function selectColor(value: string) {
    if (onValueChange) onValueChange(value);
    else setInternalValue(value);
  }

  return (
    <FormField
      label="色"
      htmlFor="color"
      error={error}
      hint="プリセット、カラーパレット、または16進カラーで指定できます。"
    >
      <div className="space-y-3">
        <div
          className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6"
          role="group"
          aria-label="色のプリセット"
        >
          <button
            type="button"
            className={cn(
              "border-input focus-visible:ring-primary flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none",
              !inputValue.trim() && "border-primary bg-secondary",
            )}
            aria-label="色を未設定にする"
            aria-pressed={!inputValue.trim()}
            onClick={() => selectColor("")}
          >
            <span aria-hidden="true">—</span>
            未設定
          </button>
          {ITEM_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={cn(
                "border-input focus-visible:ring-primary flex min-h-11 items-center gap-2 rounded-xl border px-2 text-left focus-visible:ring-2 focus-visible:outline-none",
                selectedColor === preset.value && "border-primary bg-secondary",
              )}
              aria-label={`${preset.name} ${preset.value}`}
              aria-pressed={selectedColor === preset.value}
              onClick={() => selectColor(preset.value)}
            >
              <span
                aria-hidden="true"
                className="border-border size-4 shrink-0 rounded-[0.2rem] border shadow-sm"
                style={{ backgroundColor: preset.value }}
              />
              <span className="min-w-0">
                <span className="block text-xs font-semibold">
                  {preset.name}
                </span>
                <span className="text-muted-foreground block text-[0.625rem]">
                  {preset.value}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          <label className="border-input focus-within:ring-primary flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border bg-white px-3 text-xs font-semibold focus-within:ring-2">
            <input
              type="color"
              value={selectedColor ?? FALLBACK_PICKER_COLOR}
              aria-label="カラーパレットから色を選ぶ"
              className="size-7 cursor-pointer border-0 bg-transparent p-0"
              onChange={(event) =>
                selectColor(event.currentTarget.value.toUpperCase())
              }
            />
            カラーパレット
          </label>
          <Input
            id="color"
            name="color"
            value={inputValue}
            onChange={(event) => selectColor(event.currentTarget.value)}
            onBlur={() => {
              if (selectedColor) selectColor(selectedColor);
            }}
            maxLength={7}
            pattern="#?[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?"
            placeholder="#2563EB"
            aria-label="16進カラー"
            aria-describedby="color-description"
            aria-invalid={Boolean(error) || hasInvalidInput}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div
          className="bg-secondary/70 min-h-10 rounded-xl px-3 py-2 text-sm"
          role="status"
          aria-live="polite"
        >
          {hasInvalidInput ? (
            <span className="text-destructive">
              16進カラー（例: #2563EB）で入力してください。
            </span>
          ) : (
            <ItemColorDisplay value={selectedColor} />
          )}
        </div>
      </div>
    </FormField>
  );
}
