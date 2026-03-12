import { getTranslations, setRequestLocale } from "next-intl/server";
import { Settings2, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { insetCardStyles } from "@/components/shared/ui-primitives";
import { updatePartnerSettingsAction } from "@/features/partners/actions";
import { getPartnerProfile } from "@/features/partners/data";
import { PartnerForm } from "@/features/partners/partner-form";
import { ReadinessCard } from "@/features/settings/readiness-card";
import { getBetaReadinessSnapshot } from "@/features/settings/readiness";
import { openCustomerPortalAction, startCheckoutAction } from "@/features/subscriptions/actions";
import { getSubscriptionSnapshot } from "@/features/subscriptions/data";
import { SubscriptionCard } from "@/features/subscriptions/subscription-card";

type SettingsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ billing?: string }>;
};

function getBillingBanner(
  billing: string | undefined,
  t: Awaited<ReturnType<typeof getTranslations<"Settings">>>,
) {
  if (billing === "required") {
    return {
      message: t("billingRequired"),
      tone: "warm" as const,
    };
  }

  if (billing === "success") {
    return {
      message: t("billingSuccess"),
      tone: "success" as const,
    };
  }

  if (billing === "canceled") {
    return {
      message: t("billingCanceled"),
      tone: "neutral" as const,
    };
  }

  return null;
}

export default async function SettingsPage({ params, searchParams }: SettingsPageProps) {
  const { locale } = await params;
  const { billing } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("Settings");
  const partner = await getPartnerProfile(locale);
  const readinessSnapshot = await getBetaReadinessSnapshot();
  const subscriptionSnapshot = await getSubscriptionSnapshot(locale);
  const action = updatePartnerSettingsAction.bind(null, locale);
  const checkoutAction = startCheckoutAction.bind(null, locale);
  const portalAction = openCustomerPortalAction.bind(null, locale);
  const billingBanner = getBillingBanner(billing, t);

  return (
    <div className="space-y-6">
      <PageHeader
        description={t("description")}
        eyebrow={t("title")}
        icon={Settings2}
        title={t("title")}
      >
        {billingBanner ? (
          <div className={insetCardStyles()}>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge tone={billingBanner.tone}>{t("billingBadge")}</StatusBadge>
              <p className="text-sm leading-6 text-slate-600">{billingBanner.message}</p>
            </div>
          </div>
        ) : (
          <div className={insetCardStyles()}>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge tone="neutral">{t("spaceBadge")}</StatusBadge>
              <p className="text-sm leading-6 text-slate-600">{t("spaceDescription")}</p>
            </div>
          </div>
        )}
      </PageHeader>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <SubscriptionCard
            checkoutAction={checkoutAction}
            locale={locale}
            portalAction={portalAction}
            stripeConfigured={subscriptionSnapshot.stripeConfigured}
            subscription={subscriptionSnapshot.subscription}
          />

          <section className="section-shell rounded-[32px] p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="icon-orb h-11 w-11" data-tone="blue">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {t("accountEyebrow")}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[var(--brand-navy)]">{t("accountTitle")}</h2>
              </div>
            </div>

            <PartnerForm
              action={action}
              description={t("description")}
              partner={partner}
              submitLabel={t("submit")}
              title={t("accountFormTitle")}
            />
          </section>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <ReadinessCard snapshot={readinessSnapshot} />
        </div>
      </section>
    </div>
  );
}
