"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const OAUTH_ERROR_MESSAGE =
  "Googleログインを開始できませんでした。時間をおいてもう一度お試しください。";

export function GoogleAuthButton({
  initialError = false,
}: {
  initialError?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    initialError ? OAUTH_ERROR_MESSAGE : null,
  );

  async function signInWithGoogle() {
    setPending(true);
    setErrorMessage(null);

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", "/dashboard");

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl.toString() },
      });

      if (error) {
        setErrorMessage(OAUTH_ERROR_MESSAGE);
        setPending(false);
      }
    } catch {
      setErrorMessage(OAUTH_ERROR_MESSAGE);
      setPending(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        className="w-full"
        size="lg"
        onClick={signInWithGoogle}
        disabled={pending}
        aria-disabled={pending}
      >
        {pending ? "Googleへ移動しています…" : "Googleで続ける"}
      </Button>
      {errorMessage ? (
        <p className="bg-secondary mt-4 rounded-xl p-3 text-sm" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
