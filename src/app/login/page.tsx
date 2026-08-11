import type { Metadata } from "next";
import Image from "next/image";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";

export const metadata: Metadata = { title: "ログイン" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="bg-foreground text-background hidden flex-col justify-between p-12 lg:flex">
        <div className="flex items-center gap-3 text-sm font-semibold tracking-wide">
          <span className="bg-background grid size-8 place-items-center rounded-lg">
            <Image src="/app-icon.svg" alt="" width={20} height={20} />
          </span>
          LIFE INVENTORY
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
        <p className="text-background/50 text-xs">今の持ち物 · 見直し · 理想</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Image src="/app-icon.svg" alt="" width={20} height={20} />
            <span className="text-sm font-semibold tracking-wide">
              LIFE INVENTORY
            </span>
          </div>
          <p className="text-primary text-xs font-semibold tracking-[0.18em]">
            おかえりなさい
          </p>
          <h1 className="mt-3 font-serif text-4xl">今の暮らしを見渡す</h1>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Googleアカウントでログインして持ち物一覧を開きます。初回はそのままアカウントが作成されます。
          </p>
          <div className="mt-8">
            <GoogleAuthButton initialError={error === "oauth"} />
          </div>
          <p className="text-muted-foreground mt-6 text-xs leading-5">
            認証にはGoogleの基本プロフィールとメールアドレスのみを使用します。Gmailの内容にはアクセスしません。
          </p>
        </div>
      </section>
    </main>
  );
}
