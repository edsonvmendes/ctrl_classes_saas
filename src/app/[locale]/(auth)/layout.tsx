import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarRange, CreditCard, ShieldCheck, Sparkles } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { getUser } from "@/lib/auth/session";

type AuthLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AuthLayout({
  children,
  params,
}: AuthLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getUser();
  const t = await getTranslations("AuthShell");

  if (user) {
    redirect(`/${locale}/onboarding`);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="pointer-events-none absolute inset-0 bg-app-ambient" />
      <div className="pointer-events-none absolute inset-0 texture-grid opacity-20" />
      <div className="relative mx-auto flex min-h-screen max-w-[1460px] items-center px-6 py-8 md:px-10">
        <div className="grid w-full items-center gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="surface-ink hero-glow motion-rise rounded-[40px] p-8 text-white md:p-10 xl:min-h-[760px] xl:p-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Logo theme="dark" />
              <span className="inline-flex rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/78 backdrop-blur">
                {t("eyebrow")}
              </span>
            </div>

            <div className="mt-12 max-w-2xl space-y-6">
              <h2 className="font-display text-5xl font-bold leading-[0.92] tracking-[-0.06em] text-white md:text-6xl xl:text-7xl">
                {t("title")}
              </h2>
              <p className="max-w-xl text-lg leading-8 text-slate-200">{t("description")}</p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[32px] border border-white/12 bg-white/8 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/70">
                      {t("cardTwoLabel")}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                      {t("cardTwoTitle")}
                    </p>
                  </div>
                  <span className="icon-orb h-14 w-14" data-tone="warm">
                    <CalendarRange aria-hidden="true" className="h-6 w-6" />
                  </span>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{t("cardOneLabel")}</p>
                        <p className="mt-1 text-sm text-slate-300">{t("cardOneTitle")}</p>
                      </div>
                      <Sparkles aria-hidden="true" className="h-5 w-5 text-[var(--brand-accent)]" />
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{t("cardThreeLabel")}</p>
                        <p className="mt-1 text-sm text-slate-300">{t("cardThreeTitle")}</p>
                      </div>
                      <CreditCard aria-hidden="true" className="h-5 w-5 text-[var(--brand-accent)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))] p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="icon-orb h-12 w-12" data-tone="warm">
                      <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{t("cardOneLabel")}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{t("cardOneTitle")}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/12 bg-white/6 p-6 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100/70">
                    {t("cardThreeLabel")}
                  </p>
                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-white/8 px-4 py-3">
                      <span className="text-sm font-medium text-slate-200">{t("cardOneLabel")}</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-accent)] shadow-[0_0_0_6px_rgba(255,111,97,0.12)]" />
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-white/8 px-4 py-3">
                      <span className="text-sm font-medium text-slate-200">{t("cardTwoLabel")}</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-300 shadow-[0_0_0_6px_rgba(147,197,253,0.12)]" />
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-white/8 px-4 py-3">
                      <span className="text-sm font-medium text-slate-200">{t("cardThreeLabel")}</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(110,231,183,0.12)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="motion-rise motion-delay-2 flex justify-center xl:justify-end">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
