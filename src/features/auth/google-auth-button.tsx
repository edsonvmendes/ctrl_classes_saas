"use client";

import { useState, useTransition } from "react";
import { ArrowUpRight } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type GoogleAuthButtonProps = {
  configured: boolean;
  label: string;
  locale: string;
  unavailableLabel: string;
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.8 12.23c0-.73-.07-1.43-.2-2.09H12v3.95h5.49a4.7 4.7 0 0 1-2.04 3.09v2.56h3.3c1.93-1.78 3.05-4.39 3.05-7.51Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.08-.91 6.78-2.47l-3.3-2.56c-.91.61-2.08.98-3.48.98-2.68 0-4.96-1.81-5.78-4.24H2.8v2.64A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.22 13.71A5.98 5.98 0 0 1 5.9 12c0-.59.1-1.15.27-1.71V7.65H2.8A10 10 0 0 0 2 12c0 1.6.38 3.1 1.05 4.35l3.17-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.05c1.5 0 2.85.52 3.92 1.53l2.95-2.95C17.08 2.96 14.76 2 12 2A10 10 0 0 0 2.8 7.65l3.37 2.64c.82-2.43 3.1-4.24 5.83-4.24Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleAuthButton({
  configured,
  label,
  locale,
  unavailableLabel,
}: GoogleAuthButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGoogleSignIn() {
    if (!configured || typeof window === "undefined") {
      return;
    }

    startTransition(async () => {
      setError(null);

      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: authError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?locale=${locale}`,
          },
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        if (data.url) {
          window.location.assign(data.url);
        }
      } catch (clientError) {
        setError(
          clientError instanceof Error
            ? clientError.message
            : "Unable to initialize Google OAuth in this browser.",
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        className="group inline-flex h-14 w-full items-center justify-between rounded-[22px] border border-[rgba(23,63,115,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,252,0.92))] px-5 text-sm font-semibold text-slate-700 shadow-[0_16px_34px_rgba(15,35,65,0.08)] transition hover:border-[rgba(255,111,97,0.22)] hover:bg-white disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
        disabled={!configured || isPending}
        onClick={handleGoogleSignIn}
        type="button"
      >
        <span className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <GoogleIcon />
          </span>
          <span>{label}</span>
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 text-slate-300 transition group-hover:text-[var(--brand-accent)]"
        />
      </button>
      {!configured ? <p className="text-sm text-amber-700">{unavailableLabel}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
