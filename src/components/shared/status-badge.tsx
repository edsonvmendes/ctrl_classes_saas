import type { ComponentProps } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
  {
    defaultVariants: {
      tone: "neutral",
    },
    variants: {
      tone: {
        danger: "border-red-200 bg-red-50 text-red-700",
        neutral: "border-[rgba(23,63,115,0.08)] bg-white/86 text-slate-500",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        warm: "border-[rgba(255,111,97,0.24)] bg-[rgba(255,111,97,0.1)] text-[var(--brand-accent)]",
      },
    },
  },
);

type StatusBadgeProps = ComponentProps<"span"> &
  VariantProps<typeof statusBadgeVariants>;

export function StatusBadge({
  className,
  tone,
  ...props
}: StatusBadgeProps) {
  return <span className={cn(statusBadgeVariants({ className, tone }))} {...props} />;
}
