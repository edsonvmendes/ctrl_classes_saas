import Link from "next/link";
import { Sparkles } from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { buttonStyles } from "@/components/shared/ui-primitives";

type EmptyStateProps = {
  action?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  description: string;
  icon?: LucideIcon;
  title: string;
};

export function EmptyState({
  action,
  actionHref,
  actionLabel,
  description,
  icon: Icon = Sparkles,
  title,
}: EmptyStateProps) {
  return (
    <section className="section-shell hero-glow motion-rise rounded-[32px] border border-dashed border-[rgba(85,94,106,0.16)] p-8 text-center md:p-10">
      <div className="flex justify-center">
        <span className="icon-orb h-14 w-14" data-tone="warm">
          <Icon aria-hidden="true" className="h-6 w-6" />
        </span>
      </div>
      <h2 className="mt-5 font-display text-[2rem] font-semibold tracking-[-0.04em] text-[var(--brand-navy)]">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>

      {action ? (
        <div className="mt-6 flex justify-center">{action}</div>
      ) : actionHref && actionLabel ? (
        <div className="mt-6 flex justify-center">
          <Link
            className={buttonStyles({ variant: "primary" })}
            href={actionHref}
          >
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
