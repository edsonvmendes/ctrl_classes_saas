import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  detail?: string;
  icon: LucideIcon;
  tone?: "blue" | "warm" | "ink" | "success";
  value: ReactNode;
  label: string;
};

export function MetricCard({
  detail,
  icon: Icon,
  label,
  tone = "blue",
  value,
}: MetricCardProps) {
  return (
    <article className="metric-card interactive-card motion-rise rounded-[26px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-navy)]">{value}</p>
        </div>

        <span className="icon-orb h-11 w-11" data-tone={tone}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>

      {detail ? <p className="mt-4 text-sm leading-6 text-slate-500">{detail}</p> : null}
    </article>
  );
}
