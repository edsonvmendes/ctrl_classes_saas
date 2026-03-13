import { getTranslations, setRequestLocale } from "next-intl/server";
import { CreditCard, Globe2, Settings2, Sparkles } from "lucide-react";

import { CardLabel } from "@/components/shared/card-label";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { insetCardStyles } from "@/components/shared/ui-primitives";
import { updatePartnerSettingsAction } from "@/features/partners/actions";
import { getPartnerProfile } from "@/features/partners/data";
import { PartnerForm } from "@/features/partners/partner-form";
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

function getLocaleLabel(
  locale: "pt-BR" | "en-US" | "es-ES",
  t: Awaited<ReturnType<typeof getTranslations<"PartnerForm">>>,
) {
  if (locale === "en-US") {
    return t("localeEnUs");
  }

  if (locale === "es-ES") {
    return t("localeEsEs");
  }

  return t("localePtBr");
}

function getTimezoneLabel(timezone: string) {
  return timezone.split("/").at(-1)?.replaceAll("_", " ") ?? timezone;
}

function getSubscriptionTone(status: string) {
  if (status === "active") {
    return "success" as const;
  }

  if (status === "past_due" || status === "canceled") {
    return "danger" as const;
  }

  return "warm" as const;
}

function getSubscriptionStatusLabel(
  status: string,
  t: Awaited<ReturnType<typeof getTranslations<"Subscription">>>,
) {
  if (status === "past_due") {
    return t("statusPast_due");
  }

  return t(`status${status.charAt(0).toUpperCase()}${status.slice(1)}` as "statusActive");
}

export default async function SettingsPage({ params, searchParams }: SettingsPageProps) {
  const { locale } = await params;
  const { billing } = await searchParams;
  setRequestLocale(locale);

  const [t, partnerFormT, subscriptionT] = await Promise.all([
    getTranslations("Settings"),
    getTranslations("PartnerForm"),
    getTranslations("Subscription"),
  ]);
  const partner = await getPartnerProfile(locale);
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

      <section className="space-y-6">
        <section className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <article className={insetCardStyles()}>
            <CardLabel icon={CreditCard}>{t("billingBadge")}</CardLabel>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold capitalize text-[var(--brand-navy)]">
                {subscriptionSnapshot.subscription.plan_code}
              </p>
              <StatusBadge tone={getSubscriptionTone(subscriptionSnapshot.subscription.status)}>
                {getSubscriptionStatusLabel(subscriptionSnapshot.subscription.status, subscriptionT)}
              </StatusBadge>
            </div>
          </article>

          <article className={insetCardStyles()}>
            <CardLabel icon={Globe2}>{t("accountEyebrow")}</CardLabel>
            <p className="mt-3 text-sm font-semibold text-[var(--brand-navy)]">
              {getLocaleLabel(partner.locale, partnerFormT)}
            </p>
            <p className="mt-2 text-sm text-slate-500">{getTimezoneLabel(partner.timezone)}</p>
          </article>
        </section>

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
      </section>
    </div>
  );
}
