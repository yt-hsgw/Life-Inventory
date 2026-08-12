export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center" role="status">
      <div className="text-center">
        <div className="bg-primary mx-auto size-2 animate-pulse rounded-full" />
        <p className="text-muted-foreground mt-4 text-sm">読み込んでいます…</p>
      </div>
    </div>
  );
}
