import Link from "next/link";

type RouteFeedbackProps = {
  action?: React.ReactNode;
  description: string;
  eyebrow?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  title: string;
};

export function RouteFeedback({
  action,
  description,
  eyebrow = "CTRL_Classes",
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  title,
}: RouteFeedbackProps) {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-app-ambient" />
      <div className="pointer-events-none absolute inset-0 texture-grid opacity-20" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
        <section className="panel-soft hero-glow w-full rounded-[38px] p-8 md:p-10">
          <span className="inline-flex rounded-full border border-[rgba(85,94,106,0.12)] bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-blue)]">
            {eyebrow}
          </span>
          <h1 className="font-display mt-6 text-4xl font-bold tracking-[-0.04em] text-[var(--brand-navy)] md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {action}
            {primaryHref && primaryLabel ? (
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-blue)] px-5 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-[#3555a1]"
                href={primaryHref}
              >
                {primaryLabel}
              </Link>
            ) : null}
            {secondaryHref && secondaryLabel ? (
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full border border-[rgba(85,94,106,0.14)] bg-white/75 px-5 text-sm font-semibold text-slate-700 transition hover:bg-white"
                href={secondaryHref}
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
