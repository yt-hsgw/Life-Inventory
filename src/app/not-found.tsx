import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.25em]">
          404
        </p>
        <h1 className="mt-3 font-serif text-4xl">ページが見つかりません</h1>
        <Link className={`${buttonVariants()} mt-6`} href="/dashboard">
          インベントリへ戻る
        </Link>
      </div>
    </main>
  );
}
