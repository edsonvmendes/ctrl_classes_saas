import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Activity, AlertTriangle, ArrowRight, CalendarDays, CreditCard, ShieldCheck, Users } from "lucide-react";

import { CardLabel } from "@/components/shared/card-label";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonStyles, insetCardStyles } from "@/components/shared/ui-primitives";
import { getGodDashboardSnapshot } from "@/features/god/data";

type GodDashboardPageProps = {
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

export default async function GodDashboardPage({ params }: GodDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, snapshot] = await Promise.all([
    getTranslations("GodDashboard"),
    getGodDashboardSnapshot(locale),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={(
          <Link className={buttonStyles({ variant: "primary" })} href={`/${locale}/god/tenants`}>
            {t("openTenants")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        )}
        description={t("description")}
        eyebrow={t("eyebrow")}
        icon={ShieldCheck}
        title={t("title")}
      >
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <div className={insetCardStyles()}>
            <CardLabel icon={ShieldCheck}>{t("operatorLabel")}</CardLabel>
            <p className="mt-3 text-lg font-semibold text-[var(--brand-navy)]">{snapshot.user.full_name}</p>
            <p className="mt-2 text-sm text-slate-500">{snapshot.user.email}</p>
          </div>
          <div className={insetCardStyles()}>
            <CardLabel icon={Activity}>{t("systemLabel")}</CardLabel>
            <p className="mt-3 text-lg font-semibold text-[var(--brand-navy)]">{t("systemValue")}</p>
            <p className="mt-2 text-sm text-slate-500">{t("systemDescription")}</p>
          </div>
        </div>
      </PageHeader>

      <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <MetricCard
          detail={t("partnersDetail")}
          icon={Users}
          label={t("partners")}
          tone="blue"
          value={snapshot.metrics.partners}
        />
        <MetricCard
          detail={t("activeSubscriptionsDetail")}
          icon={CreditCard}
          label={t("activeSubscriptions")}
          tone="success"
          value={snapshot.metrics.activeSubscriptions}
        />
        <MetricCard
          detail={t("pastDueDetail")}
          icon={AlertTriangle}
          label={t("pastDue")}
          tone={snapshot.metrics.pastDueSubscriptions > 0 ? "warm" : "ink"}
          value={snapshot.metrics.pastDueSubscriptions}
        />
        <MetricCard
          detail={t("trialingDetail")}
          icon={ShieldCheck}
          label={t("trialing")}
          tone="warm"
          value={snapshot.metrics.trialingSubscriptions}
        />
        <MetricCard
          detail={t("pendingPaymentsDetail")}
          icon={CreditCard}
          label={t("pendingPayments")}
          tone="warm"
          value={snapshot.metrics.pendingPayments}
        />
        <MetricCard
          detail={t("todayClassesDetail")}
          icon={CalendarDays}
          label={t("todayClasses")}
          tone="ink"
          value={snapshot.metrics.todayClasses}
        />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="section-shell rounded-[34px] p-8">
          <SectionHeading
            description={t("pastDueSectionDescription")}
            icon={AlertTriangle}
            title={t("pastDueSectionTitle")}
          />

          <div className="mt-6 space-y-3">
            {snapshot.watchlist.pastDue.length === 0 ? (
              <div className={insetCardStyles()}>
                <p className="text-sm font-semibold text-[var(--brand-navy)]">{t("pastDueEmptyTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{t("pastDueEmptyDescription")}</p>
              </div>
            ) : (
              snapshot.watchlist.pastDue.map((tenant) => (
                <article className={insetCardStyles({ padding: "lg" })} key={tenant.partnerId}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-[var(--brand-navy)]">{tenant.displayName}</p>
                        <StatusBadge tone={getSubscriptionTone(tenant.subscriptionStatus)}>
                          {tenant.subscriptionStatus}
                        </StatusBadge>
                      </div>
                      <p className="text-sm text-slate-500">{tenant.ownerName} · {tenant.email}</p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/72 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{t("plan")}</p>
                        <p className="mt-1 text-sm font-semibold text-[var(--brand-navy)]">{tenant.planCode ?? "-"}</p>
                      </div>
                      <div className="rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/72 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{t("pendingPayments")}</p>
                        <p className="mt-1 text-sm font-semibold text-[var(--brand-navy)]">{tenant.pendingPayments}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </article>

        <article className="section-shell rounded-[34px] p-8">
          <SectionHeading
            description={t("activationSectionDescription")}
            icon={Activity}
            title={t("activationSectionTitle")}
          />

          <div className="mt-6 space-y-3">
            {snapshot.watchlist.onboarding.length === 0 ? (
              <div className={insetCardStyles()}>
                <p className="text-sm font-semibold text-[var(--brand-navy)]">{t("activationEmptyTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{t("activationEmptyDescription")}</p>
              </div>
            ) : (
              snapshot.watchlist.onboarding.map((tenant) => (
                <article className={insetCardStyles({ padding: "lg" })} key={tenant.partnerId}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-[var(--brand-navy)]">{tenant.displayName}</p>
                        <StatusBadge tone="warm">{t("onboardingPending")}</StatusBadge>
                      </div>
                      <p className="text-sm text-slate-500">{tenant.ownerName} · {tenant.email}</p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/72 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{t("locale")}</p>
                        <p className="mt-1 text-sm font-semibold text-[var(--brand-navy)]">{getLocaleLabel(tenant.locale)}</p>
                      </div>
                      <div className="rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/72 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{t("timezone")}</p>
                        <p className="mt-1 text-sm font-semibold text-[var(--brand-navy)]">{getTimezoneLabel(tenant.timezone)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </article>
      </section>

      <article className="section-shell rounded-[34px] p-8">
        <SectionHeading
          action={(
            <Link className={buttonStyles({ size: "sm", variant: "secondary" })} href={`/${locale}/god/tenants`}>
              {t("openTenants")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          )}
          description={t("recentTenantsDescription")}
          icon={Users}
          title={t("recentTenantsTitle")}
        />

        <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {snapshot.recentTenants.map((tenant) => (
            <article className={insetCardStyles({ padding: "lg" })} key={tenant.partnerId}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[var(--brand-navy)]">{tenant.displayName}</p>
                  <p className="mt-1 text-sm text-slate-500">{tenant.ownerName}</p>
                </div>
                <StatusBadge tone={getSubscriptionTone(tenant.subscriptionStatus)}>
                  {tenant.subscriptionStatus}
                </StatusBadge>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/72 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{t("activeStudents")}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--brand-navy)]">{tenant.activeStudents}</p>
                </div>
                <div className="rounded-[18px] border border-[rgba(23,63,115,0.08)] bg-white/72 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{t("pendingPayments")}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--brand-navy)]">{tenant.pendingPayments}</p>
                </div>
              </div>

              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400">{tenant.partnerId}</p>
            </article>
          ))}
        </div>
      </article>
    </div>
  );
}
