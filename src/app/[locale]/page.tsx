import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Logo } from "@/components/shared/logo";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations("Home");

  return (
    <main className="bg-app-gradient relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 texture-grid opacity-30" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 md:px-10">
        <header className="motion-rise flex items-center justify-between rounded-full border border-white/10 bg-white/6 px-4 py-3 backdrop-blur md:px-6">
          <Logo theme="dark" />
          <LocaleSwitcher />
        </header>

        <section className="grid items-center gap-10 py-14 xl:grid-cols-[1.1fr_0.9fr] xl:gap-14">
          <div className="space-y-8">
            <div className="hero-glow motion-rise space-y-6">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">
                {t("eyebrow")}
              </span>
              <div className="max-w-3xl space-y-5">
                <h1 className="font-display text-5xl font-bold leading-[0.96] tracking-[-0.05em] text-balance md:text-7xl">
                  {t("title")}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-200/92 md:text-xl">
                  {t("description")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-100">
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {t("pillOne")}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {t("pillTwo")}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {t("pillThree")}
                </span>
              </div>
            </div>
            <div className="motion-rise motion-delay-1 flex flex-wrap gap-4">
              <Link
                className="inline-flex h-13 items-center justify-center rounded-full bg-[var(--brand-warm)] px-6 text-sm font-semibold text-[var(--brand-navy)] transition hover:translate-y-[-1px] hover:bg-[#f7da85]"
                href={`/${locale}/login`}
              >
                {t("loginCta")}
              </Link>
              <Link
                className="inline-flex h-13 items-center justify-center rounded-full border border-white/16 bg-white/10 px-6 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-white/16"
                href={`/${locale}/signup`}
              >
                {t("signupCta")}
              </Link>
            </div>

            <article className="motion-rise motion-delay-2 rounded-[32px] border border-white/12 bg-white/8 p-8 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
                {t("sectionTitle")}
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200/92">
                {t("sectionDescription")}
              </p>
            </article>
          </div>

          <div className="motion-rise motion-delay-2 relative">
            <div className="surface-ink motion-float rounded-[36px] border border-white/10 p-7 text-white">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
                    {t("asideEyebrow")}
                  </p>
                  <h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.04em]">
                    CTRL_Classes Studio
                  </h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-warm)]">
                  Live
                </span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-100">{t("asideItemOne")}</p>
                  <p className="mt-2 text-2xl font-semibold">Cadastro vivo</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Histórico, contato, cobrança e status reunidos no mesmo lugar.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-100">{t("asideItemTwo")}</p>
                    <p className="mt-2 text-lg font-semibold">Aulas e rotina</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-100">{t("asideItemThree")}</p>
                    <p className="mt-2 text-lg font-semibold">Fluxo financeiro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
