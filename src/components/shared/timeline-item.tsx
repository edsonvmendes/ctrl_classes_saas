import type { ReactNode } from "react";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { insetCardStyles } from "@/components/shared/ui-primitives";

type TimelineItemProps = {
  detail?: string | null;
  href?: string;
  meta?: ReactNode;
  statusLabel?: string | null;
  statusTone?: "danger" | "neutral" | "success" | "warm";
  subtitle?: string | null;
  timeLabel: string;
  title: string;
};

export function TimelineItem({
  detail,
  href,
  meta,
  statusLabel,
  statusTone = "neutral",
  subtitle,
  timeLabel,
  title,
}: TimelineItemProps) {
  const content = (
    <article className={insetCardStyles()}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="min-w-0 md:min-w-24">
            <p className="text-sm font-semibold text-[var(--brand-navy)]">{timeLabel}</p>
            {detail ? <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{detail}</p> : null}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-900">{title}</p>
              {statusLabel ? <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge> : null}
            </div>
            {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {meta}
          {href ? <ArrowRight aria-hidden="true" className="h-4 w-4 text-slate-400" /> : null}
        </div>
      </div>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link className="block" href={href}>
      {content}
    </Link>
  );
}
