import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

type CardLabelProps = {
  children: ReactNode;
  icon: LucideIcon;
  variant?: "default" | "inverse";
};

export function CardLabel({ children, icon: Icon, variant = "default" }: CardLabelProps) {
  const classes =
    variant === "inverse"
      ? "border-white/10 bg-white/8 text-blue-100"
      : "border-slate-200/80 bg-white/75 text-slate-500";
  const iconClasses = variant === "inverse" ? "text-blue-200" : "text-[var(--brand-blue)]";

  return (
    <div
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${classes}`}
    >
      <Icon aria-hidden="true" className={`h-3.5 w-3.5 ${iconClasses}`} />
      <span>{children}</span>
    </div>
  );
}
