"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { getActiveNavItem, type NavItem } from "@/components/shared/private-nav-state";

type PrivateNavProps = {
  activeSectionLabel: string;
  compact?: boolean;
  items: NavItem[];
  showActiveSectionDetails?: boolean;
};

export function PrivateNav({
  activeSectionLabel,
  compact = false,
  items,
  showActiveSectionDetails = true,
}: PrivateNavProps) {
  const pathname = usePathname();
  const activeItem = getActiveNavItem(pathname, items);

  return (
    <div className={showActiveSectionDetails ? "space-y-4" : undefined}>
      {showActiveSectionDetails && activeItem ? (
        <div className="flex flex-col gap-2 rounded-[22px] border border-[rgba(23,63,115,0.1)] bg-white/72 px-4 py-3 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
              {activeSectionLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--brand-navy)]">{activeItem.label}</p>
          </div>
          {activeItem.description ? (
            <p className="max-w-xl text-sm leading-6 text-slate-500 md:text-right">{activeItem.description}</p>
          ) : null}
        </div>
      ) : null}

      <nav className="flex flex-wrap items-center gap-2.5">
        {items.map((item) => {
          const active = activeItem?.href === item.href;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center justify-center rounded-full font-semibold transition ${
                compact ? "h-9 px-3 text-xs" : "h-10 px-4 text-sm"
              } ${
                active
                  ? "bg-[linear-gradient(135deg,#0f2341_0%,#163761_58%,#ff6f61_100%)] text-white shadow-[0_18px_34px_rgba(15,35,65,0.24)]"
                  : "border border-[rgba(23,63,115,0.12)] bg-white/75 text-slate-600 hover:border-[rgba(255,111,97,0.28)] hover:bg-white hover:text-slate-950"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
