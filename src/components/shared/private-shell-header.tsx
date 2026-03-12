"use client";

import { LogOut, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { getActiveNavItem, type NavItem } from "@/components/shared/private-nav-state";

type PrivateShellHeaderProps = {
  activeSectionLabel: string;
  items: NavItem[];
  settingsHref: string;
  settingsLabel: string;
  signOutAction: () => void | Promise<void>;
  signOutLabel: string;
  userEmail: string;
  workspaceLabel: string;
};

export function PrivateShellHeader({
  activeSectionLabel,
  items,
  settingsHref,
  settingsLabel,
  signOutAction,
  signOutLabel,
  userEmail,
  workspaceLabel,
}: PrivateShellHeaderProps) {
  const pathname = usePathname();
  const activeItem = getActiveNavItem(pathname, items);

  return (
    <header className="panel-soft hero-glow rounded-[30px] px-4 py-4 md:px-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-[20px] border border-[rgba(23,63,115,0.08)] bg-white p-2 shadow-[0_18px_36px_rgba(15,35,65,0.08)] lg:hidden">
            <Logo size={30} theme="light" variant="icon" />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              {activeSectionLabel}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-lg font-semibold text-[var(--brand-navy)]">
                {activeItem?.label ?? workspaceLabel}
              </p>
              {activeItem?.description ? (
                <p className="text-sm text-slate-500">{activeItem.description}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <span className="inline-flex max-w-full items-center rounded-full border border-[rgba(23,63,115,0.12)] bg-white/82 px-3.5 py-2 text-sm font-medium text-slate-600">
            <span className="truncate">{userEmail}</span>
          </span>

          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-[rgba(23,63,115,0.14)] bg-white/82 px-4 text-sm font-semibold text-slate-600 transition hover:border-[rgba(255,111,97,0.28)] hover:bg-white hover:text-slate-950"
            href={settingsHref}
          >
            <Settings2 className="mr-2 h-4 w-4" />
            {settingsLabel}
          </Link>

          <form action={signOutAction}>
            <button
              className="inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f2341_0%,#173f73_58%,#ff6f61_100%)] px-5 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(15,35,65,0.24)] transition hover:translate-y-[-1px] hover:brightness-105"
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
