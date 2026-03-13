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
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          {eyebrow && icon ? <CardLabel icon={icon}>{eyebrow}</CardLabel> : null}
          <h1
            className={`font-display text-3xl font-bold tracking-[-0.045em] text-[var(--brand-navy)] md:text-4xl ${
              eyebrow && icon ? "mt-4" : ""
            }`}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">{description}</p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex w-full flex-wrap items-center gap-3 xl:w-auto xl:justify-end">{actions}</div>
        ) : null}
      </div>

      {children ? (
        <div className="mt-6 border-t border-[rgba(23,63,115,0.08)] pt-6">{children}</div>
      ) : null}
    </section>
  );
}
