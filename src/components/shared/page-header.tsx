import type { LucideIcon } from "lucide-react";

import { CardLabel } from "@/components/shared/card-label";

type PageHeaderProps = {
  actions?: React.ReactNode;
  children?: React.ReactNode;
  description?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  title: string;
};

export function PageHeader({
  actions,
  children,
  description,
  eyebrow,
  icon,
  title,
}: PageHeaderProps) {
  return (
    <section className="panel-soft hero-glow motion-rise rounded-[36px] p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          {eyebrow && icon ? <CardLabel icon={icon}>{eyebrow}</CardLabel> : null}
          <h1
            className={`font-display text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)] md:text-4xl ${
              eyebrow && icon ? "mt-4" : ""
            }`}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">{description}</p>
          ) : null}
        </div>

        {actions ? <div className="flex flex-wrap items-center gap-3 md:justify-end">{actions}</div> : null}
      </div>

      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
