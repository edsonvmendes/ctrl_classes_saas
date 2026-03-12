"use client";

import { RouteFeedback } from "@/components/shared/route-feedback";
import { getFeedbackCopy } from "@/lib/i18n/feedback-copy";
import { defaultLocale } from "@/i18n/routing";
import { useParams } from "next/navigation";

type PrivateErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PrivateError({ error, reset }: PrivateErrorProps) {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? defaultLocale;
  const copy = getFeedbackCopy(locale);

  return (
    <RouteFeedback
      action={
        <button
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          onClick={reset}
          type="button"
        >
          {copy.errorRetry}
        </button>
      }
      description={`${copy.errorDescription}${error.digest ? ` (${error.digest})` : ""}`}
      eyebrow={copy.loadingEyebrow}
      primaryHref={`/${locale}${copy.appHref}`}
      primaryLabel={copy.appCta}
      secondaryHref={`/${locale}${copy.homeHref}`}
      secondaryLabel={copy.homeCta}
      title={copy.errorTitle}
    />
  );
}
