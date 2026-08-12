export default function AuthenticatedLoading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <div className="space-y-3">
        <div className="bg-secondary h-3 w-24 animate-pulse rounded-full" />
        <div className="bg-secondary h-12 w-56 animate-pulse rounded-2xl" />
        <div className="bg-secondary h-4 max-w-lg animate-pulse rounded-full" />
      </div>
      <div className="border-border bg-card grid min-h-56 place-items-center rounded-3xl border p-8">
        <div className="text-center">
          <div className="border-primary/25 border-t-primary mx-auto size-8 animate-spin rounded-full border-2" />
          <p className="text-muted-foreground mt-4 text-sm">
            画面を読み込んでいます…
          </p>
        </div>
      </div>
    </div>
  );
}
