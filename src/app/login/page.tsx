import type { Metadata } from "next";
import { Leaf } from "lucide-react";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = { title: "ログイン" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="bg-foreground text-background hidden flex-col justify-between p-12 lg:flex">
        <div className="flex items-center gap-3 text-sm font-semibold tracking-wide">
          <Leaf className="size-5" /> LIFE INVENTORY
        </div>
        <div className="max-w-xl">
          <p className="font-serif text-6xl leading-[1.05]">
            持ち物から、
            <br />
            暮らしを整える。
          </p>
          <p className="text-background/70 mt-8 max-w-md text-base leading-8">
            何を持ち、何を残し、どんな生活をつくりたいか。数字を減らすためではなく、自分の基準を見つけるための場所です。
          </p>
        </div>
        <p className="text-background/50 text-xs">Current · Review · Ideal</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Leaf className="text-primary size-5" />
            <span className="text-sm font-semibold tracking-wide">
              LIFE INVENTORY
            </span>
          </div>
          <p className="text-primary text-xs font-semibold tracking-[0.18em]">
            WELCOME BACK
          </p>
          <h1 className="mt-3 font-serif text-4xl">今の暮らしを見渡す</h1>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            ログインしてInventoryを開きます。
          </p>
          <div className="mt-8">
            <AuthForm mode="sign-in" />
          </div>
          <details className="border-border mt-8 border-t pt-6">
            <summary className="focus-visible:ring-primary cursor-pointer text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none">
              初めて使う方
            </summary>
            <div className="mt-5">
              <AuthForm mode="sign-up" />
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
