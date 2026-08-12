import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: FormFieldProps) {
  const descriptionId = `${htmlFor}-description`;
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={descriptionId} className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={descriptionId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
