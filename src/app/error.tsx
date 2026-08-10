"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-serif text-3xl">うまく読み込めませんでした</p>
        <p className="text-muted-foreground mt-3 text-sm">
          接続を確認して、もう一度お試しください。
        </p>
        <Button className="mt-6" onClick={reset}>
          再試行
        </Button>
      </div>
    </main>
  );
}
