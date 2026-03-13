import { getTranslations } from "next-intl/server";
import { Activity, CreditCard, Database, Gauge, Link2, ShieldCheck, Wrench } from "lucide-react";

import { CardLabel } from "@/components/shared/card-label";
import { StatusBadge } from "@/components/shared/status-badge";
import { insetCardStyles } from "@/components/shared/ui-primitives";
import type { BetaReadinessSnapshot } from "@/features/settings/readiness";

function getBadgeClasses(status: BetaReadinessSnapshot["overallStatus"]) {
  return status === "ok"
    ? "success"
    : "warm";
}

function getDatabaseBadgeClasses(status: BetaReadinessSnapshot["database"]["status"]) {
  if (status === "ok") {
    return "success";
  }

  if (status === "degraded") {
    return "danger";
  }

  return "neutral";
}

export async function ReadinessCard({ snapshot }: { snapshot: BetaReadinessSnapshot }) {
  const t = await getTranslations("Readiness");

  return (
    <section className="section-shell rounded-[32px] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <CardLabel icon={Gauge}>{t("title")}</CardLabel>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--brand-navy)]">{t("title")}</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">{t("description")}</p>
        </div>
        <StatusBadge tone={getBadgeClasses(snapshot.overallStatus)}>
          {t(`overall${snapshot.overallStatus === "ok" ? "Ok" : "Attention"}`)}
        </StatusBadge>
      </div>

      <div className="mt-5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        <article className={insetCardStyles()}>
          <CardLabel icon={Gauge}>{t("environmentCoverage")}</CardLabel>
          <p className="mt-2 text-2xl font-bold text-[var(--brand-navy)]">
            {snapshot.environment.summary.configured}/{snapshot.environment.summary.total}
          </p>
          <p className="mt-2 text-sm text-slate-500">{t("environmentCoverageDescription")}</p>
        </article>
        <article className={insetCardStyles()}>
          <div className="flex items-center justify-between gap-3">
            <CardLabel icon={Database}>{t("database")}</CardLabel>
            <StatusBadge tone={getDatabaseBadgeClasses(snapshot.database.status)}>
              {t(
                `database${snapshot.database.status === "ok" ? "Ok" : snapshot.database.status === "degraded" ? "Degraded" : "NotConfigured"}`,
              )}
            </StatusBadge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {snapshot.database.error ? snapshot.database.error : t("databaseDescription")}
          </p>
        </article>
        <article className={insetCardStyles()}>
          <CardLabel icon={Activity}>{t("checks")}</CardLabel>
          <div className="mt-2 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">{t("healthEndpointLabel")}:</span>{" "}
              <code>{snapshot.healthEndpoint}</code>
            </p>
            <p>
              <span className="font-semibold text-slate-900">{t("cliCommandLabel")}:</span>{" "}
              <code>{snapshot.cliCommand}</code>
            </p>
          </div>
        </article>
      </div>

      <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {snapshot.sections.map((section) => (
          <article className={insetCardStyles({ padding: "lg" })} key={section.key}>
            <CardLabel
              icon={
                section.key === "app"
                  ? ShieldCheck
                  : section.key === "auth"
                    ? Wrench
                    : CreditCard
              }
            >
              {t(`section${section.key.charAt(0).toUpperCase()}${section.key.slice(1)}`)}
            </CardLabel>
            <div className="mt-4 space-y-3">
              {section.items.map((item) => (
                <div className="flex items-center justify-between gap-3" key={item.key}>
                  <p className="text-sm text-slate-700">{t(`item${item.key.charAt(0).toUpperCase()}${item.key.slice(1)}`)}</p>
                  <StatusBadge tone={item.configured ? "success" : "warm"}>
                    {item.configured ? t("configured") : t("missing")}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        <article className={insetCardStyles({ padding: "lg" })}>
          <CardLabel icon={Link2}>{t("referenceTitle")}</CardLabel>
          <div className="mt-4 space-y-3">
            {snapshot.references.map((reference) => (
              <div className="space-y-1" key={reference.key}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {t(`reference${reference.key.charAt(0).toUpperCase()}${reference.key.slice(1)}`)}
                </p>
                <p className="break-all text-sm text-slate-700">{reference.value ?? t("notAvailable")}</p>
              </div>
            ))}
          </div>
        </article>

        <article className={insetCardStyles({ padding: "lg" })}>
          <CardLabel icon={Wrench}>{t("missingTitle")}</CardLabel>
          {snapshot.environment.missing.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/82 px-4 py-3 text-sm text-emerald-700">
              {t("missingEmpty")}
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {snapshot.environment.missing.map((variable) => (
                <code
                  className="rounded-full border border-[rgba(245,158,11,0.22)] bg-amber-50/82 px-3 py-1 text-xs font-semibold text-amber-900"
                  key={variable}
                >
                  {variable}
                </code>
              ))}
            </div>
          )}
          <p className="mt-4 text-sm leading-6 text-slate-500">{t("missingDescription")}</p>
        </article>
      </div>
    </section>
  );
}
