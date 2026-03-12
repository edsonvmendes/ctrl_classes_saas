"use client";

import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { Logo } from "@/components/shared/logo";
import { privateNavIcons } from "@/components/shared/private-nav-icons";
import {
  getPrivateShellModeSnapshot,
  setPrivateShellMode,
  subscribeToPrivateShellMode,
} from "@/components/shared/private-shell-preference";
import { getActiveNavItem, type NavItem } from "@/components/shared/private-nav-state";

type PrivateSidebarProps = {
  activeSectionLabel: string;
  collapseLabel: string;
  expandLabel: string;
  items: NavItem[];
  settingsHref: string;
  settingsLabel: string;
  shortcutLabel: string;
  workspaceLabel: string;
};

export function PrivateSidebar({
  activeSectionLabel,
  collapseLabel,
  expandLabel,
  items,
  settingsHref,
  settingsLabel,
  shortcutLabel,
  workspaceLabel,
}: PrivateSidebarProps) {
  const pathname = usePathname();
  const activeItem = getActiveNavItem(pathname, items);
  const mode = useSyncExternalStore(
    subscribeToPrivateShellMode,
    getPrivateShellModeSnapshot,
    () => "expanded",
  );
  const isCollapsed = mode === "collapsed";

  return (
    <aside
      className={`panel-soft hidden h-[calc(100vh-3rem)] shrink-0 flex-col rounded-[34px] p-4 lg:flex ${
        isCollapsed ? "w-24" : "w-[290px]"
      }`}
    >
      <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} gap-3`}>
        <div className="flex items-center gap-3">
          <div className="rounded-[22px] border border-[rgba(23,63,115,0.08)] bg-white p-2.5 shadow-[0_18px_36px_rgba(15,35,65,0.08)]">
            <Logo size={36} theme="light" variant="icon" />
          </div>
          {!isCollapsed ? (
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-clay)]">
                {workspaceLabel}
              </p>
              <p className="mt-1 font-display text-[1.5rem] font-bold leading-none tracking-[-0.05em] text-[var(--brand-navy)]">
                CTRL_Classes
              </p>
            </div>
          ) : null}
        </div>

        <button
          aria-label={isCollapsed ? expandLabel : collapseLabel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(23,63,115,0.12)] bg-white text-slate-600 transition hover:border-[rgba(255,111,97,0.28)] hover:text-slate-950"
          onClick={() => setPrivateShellMode(isCollapsed ? "expanded" : "collapsed")}
          type="button"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!isCollapsed && activeItem ? (
        <div className="mt-6 rounded-[24px] border border-[rgba(23,63,115,0.1)] bg-white/72 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {activeSectionLabel}
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--brand-navy)]">{activeItem.label}</p>
          {activeItem.description ? <p className="mt-2 text-sm leading-6 text-slate-500">{activeItem.description}</p> : null}
        </div>
      ) : null}

      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const active = activeItem?.href === item.href;
          const Icon = privateNavIcons[item.icon];

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-[22px] px-3 py-3 transition ${
                active
                  ? "bg-[linear-gradient(135deg,#0f2341_0%,#163761_58%,#ff6f61_100%)] text-white shadow-[0_18px_34px_rgba(15,35,65,0.24)]"
                  : "text-slate-600 hover:bg-white hover:text-slate-950"
              } ${isCollapsed ? "justify-center" : ""}`}
              href={item.href}
              key={item.href}
              title={item.label}
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                  active
                    ? "border-white/20 bg-white/12"
                    : "border-[rgba(23,63,115,0.1)] bg-white/84 text-[var(--brand-blue)]"
                }`}
              >
                <Icon aria-hidden="true" className="h-4.5 w-4.5" />
              </span>
              {!isCollapsed ? (
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  {item.description ? (
                    <span className={`block text-xs leading-5 ${active ? "text-white/78" : "text-slate-400"}`}>
                      {item.description}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className={`mt-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} gap-3 rounded-[24px] border border-[rgba(23,63,115,0.1)] bg-white/72 px-3 py-3`}>
        {!isCollapsed ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{shortcutLabel}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--brand-navy)]">{settingsLabel}</p>
          </div>
        ) : null}
        <Link
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(23,63,115,0.12)] bg-white text-slate-600 transition hover:border-[rgba(255,111,97,0.28)] hover:text-slate-950"
          href={settingsHref}
          title={settingsLabel}
        >
          <Settings2 className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
