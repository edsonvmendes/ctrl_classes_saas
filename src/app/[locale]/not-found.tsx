"use client";

import { RouteFeedback } from "@/components/shared/route-feedback";
import { getFeedbackCopy } from "@/lib/i18n/feedback-copy";
import { defaultLocale } from "@/i18n/routing";
import { useParams } from "next/navigation";

export default function LocaleNotFound() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? defaultLocale;
  const copy = getFeedbackCopy(locale);

  return (
    <RouteFeedback
      description={copy.notFoundDescription}
      eyebrow={copy.notFoundEyebrow}
      primaryHref={`/${locale}${copy.appHref}`}
      primaryLabel={copy.appCta}
      secondaryHref={`/${locale}${copy.homeHref}`}
      secondaryLabel={copy.homeCta}
      title={copy.notFoundTitle}
    />
  );
}
