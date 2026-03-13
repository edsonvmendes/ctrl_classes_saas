"use client";

import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

import { getActiveGodNavItem, type GodNavItem } from "@/features/god/god-nav-state";

type GodShellHeaderProps = {
  items: GodNavItem[];
  signOutAction: () => void | Promise<void>;
  signOutLabel: string;
  userEmail: string;
  workspaceLabel: string;
};

export function GodShellHeader({
  items,
  signOutAction,
  signOutLabel,
  userEmail,
  workspaceLabel,
}: GodShellHeaderProps) {
  const pathname = usePathname();
  const activeItem = getActiveGodNavItem(pathname, items);

  return (
    <header className="surface-ink rounded-[30px] px-4 py-4 text-white md:px-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100/70">
            {workspaceLabel}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-lg font-semibold text-white">
              {activeItem?.label ?? workspaceLabel}
            </p>
            {activeItem?.description ? (
              <p className="text-sm text-slate-300">{activeItem.description}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <span className="inline-flex max-w-full items-center rounded-full border border-white/10 bg-white/8 px-3.5 py-2 text-sm font-medium text-slate-200">
            <span className="truncate">{userEmail}</span>
          </span>

          <form action={signOutAction}>
            <button
              className="inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6f61_0%,#163761_54%,#0f2341_100%)] px-5 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(15,35,65,0.28)] transition hover:translate-y-[-1px] hover:brightness-105"
              type="submit"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {signOutLabel}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
