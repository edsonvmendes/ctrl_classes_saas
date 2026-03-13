import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

import { CardLabel } from "@/components/shared/card-label";

type SectionHeadingProps = {
  action?: ReactNode;
  description?: string;
  icon: LucideIcon;
  title: string;
};

export function SectionHeading({
  action,
  description,
  icon,
  title,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <CardLabel icon={icon}>{title}</CardLabel>
        <h2 className="mt-3 font-display text-[1.7rem] font-semibold tracking-[-0.04em] text-[var(--brand-navy)]">
          {title}
        </h2>
        {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>

      {action ? <div className="flex flex-wrap items-center gap-3">{action}</div> : null}
    </div>
  );
}
