import { cn } from "@/lib/utils";
import { insetCardStyles } from "@/components/shared/ui-primitives";

export function SkeletonBlock({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "skeleton-shimmer rounded-[22px]",
        className,
      )}
    />
  );
}

export function PrivatePageLoadingState() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <div className="overflow-hidden rounded-full border border-[rgba(23,63,115,0.1)] bg-white/70 p-1">
        <SkeletonBlock className="h-1.5 w-32 rounded-full md:w-48" />
      </div>

      <section className="panel-soft hero-glow rounded-[34px] p-7 md:p-8">
        <SkeletonBlock className="h-5 w-36 rounded-full" />
        <SkeletonBlock className="mt-5 h-11 w-2/3 max-w-xl rounded-[24px]" />
        <SkeletonBlock className="mt-3 h-5 w-full max-w-2xl rounded-full" />
        <SkeletonBlock className="mt-2 h-5 w-5/6 max-w-xl rounded-full" />

        <div className="mt-6 flex flex-wrap gap-3">
          <SkeletonBlock className="h-11 w-36 rounded-full" />
          <SkeletonBlock className="h-11 w-40 rounded-full" />
          <SkeletonBlock className="h-11 w-32 rounded-full" />
        </div>
      </section>

      <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="section-shell rounded-[28px] p-5" key={index}>
            <SkeletonBlock className="h-4 w-24 rounded-full" />
            <SkeletonBlock className="mt-4 h-10 w-20 rounded-[18px]" />
            <SkeletonBlock className="mt-3 h-4 w-32 rounded-full" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div className="section-shell rounded-[32px] p-6 md:p-8" key={index}>
              <SkeletonBlock className="h-5 w-28 rounded-full" />
              <SkeletonBlock className="mt-3 h-9 w-1/2 rounded-[20px]" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 3 }).map((__, itemIndex) => (
                  <div className={insetCardStyles({ padding: "lg" })} key={itemIndex}>
                    <SkeletonBlock className="h-5 w-40 rounded-full" />
                    <SkeletonBlock className="mt-3 h-4 w-full rounded-full" />
                    <SkeletonBlock className="mt-2 h-4 w-2/3 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div className="section-shell rounded-[32px] p-6" key={index}>
              <SkeletonBlock className="h-5 w-24 rounded-full" />
              <SkeletonBlock className="mt-3 h-8 w-1/2 rounded-[18px]" />
              <div className="mt-5 grid gap-3">
                {Array.from({ length: index === 0 ? 3 : 2 }).map((__, itemIndex) => (
                  <SkeletonBlock className="h-20 w-full rounded-[24px]" key={itemIndex} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PublicPageLoadingState() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-app-ambient" />
      <div className="pointer-events-none absolute inset-0 texture-grid opacity-20" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
        <section className="panel-soft hero-glow w-full rounded-[38px] p-8 md:p-10">
          <div aria-busy="true" aria-live="polite" className="space-y-4">
            <SkeletonBlock className="h-4 w-28 rounded-full" />
            <SkeletonBlock className="h-12 w-2/3 rounded-[24px]" />
            <SkeletonBlock className="h-5 w-full rounded-full" />
            <SkeletonBlock className="h-5 w-5/6 rounded-full" />
            <div className="flex gap-3 pt-4">
              <SkeletonBlock className="h-11 w-32 rounded-full" />
              <SkeletonBlock className="h-11 w-28 rounded-full" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
