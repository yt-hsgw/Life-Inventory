import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-primary text-xs font-bold tracking-[0.18em]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
