import { getTranslations, setRequestLocale } from "next-intl/server";
import { Building2, CreditCard, Globe2, MapPinned, ShieldCheck, Users } from "lucide-react";

import { CardLabel } from "@/components/shared/card-label";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { insetCardStyles } from "@/components/shared/ui-primitives";
import { getGodTenantsSnapshot } from "@/features/god/data";
import { formatOptionalDateOnly } from "@/lib/formatters/intl";

type GodTenantsPageProps = {
  params: Promise<{ locale: string }>;
};

function getSubscriptionTone(status: string) {
  if (status === "active") {
    return "success" as const;
  }

  if (status === "past_due" || status === "canceled" || status === "missing") {
    return "danger" as const;
  }

  return "warm" as const;
}

function getLocaleLabel(locale: string) {
  if (locale === "en-US") {
    return "English (US)";
  }

  if (locale === "es-ES") {
    return "Español";
  }

  return "Português (Brasil)";
}

function getTimezoneLabel(timezone: string) {
  return timezone.split("/").at(-1)?.replaceAll("_", " ") ?? timezone;
}

export default async function GodTenantsPage({ params }: GodTenantsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, snapshot] = await Promise.all([
    getTranslations("GodTenants"),
    getGodTenantsSnapshot(locale),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        description={t("description")}
        eyebrow={t("eyebrow")}
        icon={Building2}
        title={t("title")}
      >
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <div className={insetCardStyles()}>
            <CardLabel icon={Building2}>{t("totalTenants")}</CardLabel>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-navy)]">{snapshot.summary.total}</p>
          </div>
          <div className={insetCardStyles()}>
            <CardLabel icon={CreditCard}>{t("pastDue")}</CardLabel>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-navy)]">{snapshot.summary.pastDue}</p>
          </div>
          <div className={insetCardStyles()}>
            <CardLabel icon={ShieldCheck}>{t("missingSubscription")}</CardLabel>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-navy)]">{snapshot.summary.missingSubscription}</p>
          </div>
          <div className={insetCardStyles()}>
            <CardLabel icon={Users}>{t("withoutOnboarding")}</CardLabel>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-navy)]">{snapshot.summary.withoutOnboarding}</p>
          </div>
        </div>
      </PageHeader>

      <article className="section-shell rounded-[34px] p-8">
        <SectionHeading
          description={t("listDescription")}
          icon={Building2}
          title={t("listTitle")}
        />

        <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          {snapshot.tenants.map((tenant) => (
            <article className={insetCardStyles({ padding: "lg" })} key={tenant.partnerId}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-[var(--brand-navy)]">{tenant.displayName}</p>
                  <p className="mt-1 text-sm text-slate-500">{tenant.ownerName} · {tenant.email}</p>
                </div>
                <StatusBadge tone={getSubscriptionTone(tenant.subscriptionStatus)}>
                  {tenant.subscriptionStatus}
                </StatusBadge>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/72 px-3 py-3">
                  <CardLabel icon={CreditCard}>{t("plan")}</CardLabel>
                  <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">{tenant.planCode ?? "-"}</p>
                </div>
                <div className="rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/72 px-3 py-3">
                  <CardLabel icon={ShieldCheck}>{t("onboarding")}</CardLabel>
                  <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                    {tenant.onboardingCompletedAt ? t("onboardingDone") : t("onboardingPending")}
                  </p>
                </div>
                <div className="rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/72 px-3 py-3">
                  <CardLabel icon={Users}>{t("activeStudents")}</CardLabel>
                  <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">{tenant.activeStudents}</p>
                </div>
                <div className="rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/72 px-3 py-3">
                  <CardLabel icon={CreditCard}>{t("pendingPayments")}</CardLabel>
                  <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">{tenant.pendingPayments}</p>
                </div>
                <div className="rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/72 px-3 py-3">
                  <CardLabel icon={Globe2}>{t("locale")}</CardLabel>
                  <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">{getLocaleLabel(tenant.locale)}</p>
                </div>
                <div className="rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/72 px-3 py-3">
                  <CardLabel icon={MapPinned}>{t("timezone")}</CardLabel>
                  <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">{getTimezoneLabel(tenant.timezone)}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <StatusBadge tone="neutral">{tenant.currency}</StatusBadge>
                <StatusBadge tone="neutral">{t("todayClasses")}: {tenant.classesToday}</StatusBadge>
                <StatusBadge tone="neutral">{formatOptionalDateOnly(tenant.createdAt, locale)}</StatusBadge>
              </div>

              <p className="mt-4 rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/64 px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {tenant.partnerId}
              </p>
            </article>
          ))}
        </div>
      </article>
    </div>
  );
}
