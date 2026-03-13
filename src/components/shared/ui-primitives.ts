import { cva } from "class-variance-authority";

export const buttonStyles = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,111,97,0.12)] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60",
  {
    defaultVariants: {
      size: "md",
      variant: "secondary",
    },
    variants: {
      size: {
        icon: "h-10 w-10 p-0",
        sm: "h-10 px-4",
        md: "h-11 px-5",
        lg: "h-12 px-6",
      },
      variant: {
        filter:
          "border border-[rgba(23,63,115,0.1)] bg-white/76 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-[rgba(255,111,97,0.24)] hover:bg-white hover:text-slate-950",
        filterActive:
          "border border-transparent bg-[linear-gradient(135deg,#0f2341_0%,#173f73_58%,#ff6f61_100%)] text-white shadow-[0_16px_30px_rgba(15,35,65,0.22)] hover:translate-y-[-1px] hover:brightness-105",
        ghost:
          "border border-white/16 bg-white/10 text-white backdrop-blur hover:bg-white/16",
        icon:
          "border border-[rgba(23,63,115,0.12)] bg-white/84 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] hover:border-[rgba(255,111,97,0.26)] hover:bg-white hover:text-slate-950",
        iconDanger:
          "border border-red-200/80 bg-white/84 text-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] hover:bg-red-50",
        iconSuccess:
          "border border-emerald-200/80 bg-white/84 text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] hover:bg-emerald-50",
        iconWarning:
          "border border-[rgba(245,158,11,0.26)] bg-white/84 text-amber-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] hover:bg-amber-50",
        primary:
          "border border-transparent bg-[linear-gradient(135deg,#0f2341_0%,#173f73_58%,#ff6f61_100%)] text-white shadow-[0_18px_36px_rgba(15,35,65,0.22)] hover:translate-y-[-1px] hover:brightness-105",
        secondary:
          "border border-[rgba(23,63,115,0.1)] bg-white/84 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] hover:border-[rgba(255,111,97,0.24)] hover:bg-white",
        warm:
          "border border-transparent bg-[var(--brand-warm)] text-[var(--brand-navy)] shadow-[0_18px_36px_rgba(15,35,65,0.18)] hover:translate-y-[-1px] hover:bg-[#f7da85]",
      },
    },
  },
);

export const fieldStyles = cva(
  "w-full rounded-[22px] border border-[rgba(23,63,115,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,252,0.92))] px-4 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] outline-none transition focus:border-[rgba(255,111,97,0.38)] focus:ring-4 focus:ring-[rgba(255,111,97,0.12)] disabled:cursor-not-allowed disabled:opacity-60",
  {
    defaultVariants: {
      control: "input",
    },
    variants: {
      control: {
        input: "h-13",
        select: "h-13 appearance-none",
        textarea: "min-h-36 py-3",
      },
    },
  },
);

export const insetCardStyles = cva(
  "interactive-card rounded-[24px] border border-[rgba(23,63,115,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(244,247,252,0.88))] shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] hover:border-[rgba(255,111,97,0.16)]",
  {
    defaultVariants: {
      padding: "md",
    },
    variants: {
      padding: {
        md: "p-4",
        lg: "p-5",
      },
    },
  },
);

export const dataTableShellClassName = "section-shell overflow-hidden rounded-[32px]";

export const dataTableHeaderClassName =
  "border-b border-[rgba(23,63,115,0.08)] bg-white/58 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400";

export const dataTableRowClassName =
  "px-6 py-5 text-sm transition hover:bg-white/58";

export const dataTableMutedTextClassName = "text-slate-600";
