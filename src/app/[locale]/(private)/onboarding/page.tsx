import { getTranslations, setRequestLocale } from "next-intl/server";
import { Sparkles } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { insetCardStyles } from "@/components/shared/ui-primitives";
import { completeOnboardingAction } from "@/features/partners/actions";
import { getPartnerProfile } from "@/features/partners/data";
import { PartnerForm } from "@/features/partners/partner-form";

type OnboardingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Onboarding");
  const partner = await getPartnerProfile(locale);
  const action = completeOnboardingAction.bind(null, locale);
  const steps = [t("stepOne"), t("stepTwo"), t("stepThree")];

  return (
    <div className="space-y-6">
      <PageHeader
        description={t("description")}
        eyebrow={t("eyebrow")}
        icon={Sparkles}
        title={t("title")}
      >
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {steps.map((step, index) => (
            <div className={insetCardStyles()} key={step}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t("stepLabel", { count: index + 1 })}
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <section className="rounded-[32px]">
          <PartnerForm
            action={action}
            description={t("description")}
            partner={partner}
            submitLabel={t("submit")}
            title={t("title")}
          />
        </section>

        <aside className="space-y-6 2xl:sticky 2xl:top-6 2xl:self-start">
          <section className="surface-ink hero-glow rounded-[32px] border border-white/10 p-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100/78">
              {t("asideTitle")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">
              {t("asideTitle")}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-200">{t("asideHint")}</p>

            <div className="mt-5 space-y-3">
              {steps.map((item, index) => (
                <div
                  className="interactive-card flex items-center justify-between rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm"
                  key={item}
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100/70">
                      {t("stepLabel", { count: index + 1 })}
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">{item}</p>
                  </div>
                  <StatusBadge tone={partner.onboarding_completed_at ? "success" : "warm"}>
                    {partner.onboarding_completed_at ? t("stepDone") : t("stepPending")}
                  </StatusBadge>
                </div>
              ))}
            </div>

            {partner.onboarding_completed_at ? (
              <p className="mt-5 text-sm text-emerald-300">{t("completed")}</p>
            ) : null}
          </section>

          {!partner.onboarding_completed_at ? (
            <EmptyState
              description={t("asideHint")}
              title={t("asideCtaTitle")}
            />
          ) : null}
        </aside>
      </section>
    </div>
  );
}
