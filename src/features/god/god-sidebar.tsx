"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { godNavIcons } from "@/features/god/god-nav-icons";
import { getActiveGodNavItem, type GodNavItem } from "@/features/god/god-nav-state";

type GodSidebarProps = {
  items: GodNavItem[];
  missionDescription: string;
  missionTitle: string;
  workspaceLabel: string;
};

export function GodSidebar({
  items,
  missionDescription,
  missionTitle,
  workspaceLabel,
}: GodSidebarProps) {
  const pathname = usePathname();
  const activeItem = getActiveGodNavItem(pathname, items);

  return (
    <aside className="surface-ink hidden h-[calc(100vh-3rem)] w-[308px] shrink-0 flex-col rounded-[34px] p-4 text-white lg:flex">
      <div className="rounded-[26px] border border-white/10 bg-white/6 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-[22px] border border-white/12 bg-white/10 p-2.5">
            <Logo size={36} theme="dark" variant="icon" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100/70">
              {workspaceLabel}
            </p>
            <p className="mt-1 font-display text-[1.45rem] font-bold tracking-[-0.05em] text-white">
              CTRL_GOD
            </p>
          </div>
        </div>

        {activeItem ? (
          <div className="mt-5 rounded-[22px] border border-white/10 bg-white/8 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-100/60">
              {activeItem.label}
            </p>
            {activeItem.description ? <p className="mt-2 text-sm leading-6 text-slate-300">{activeItem.description}</p> : null}
          </div>
        ) : null}
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const active = activeItem?.href === item.href;
          const Icon = godNavIcons[item.icon];

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-[24px] px-3.5 py-3.5 transition ${
                active
                  ? "bg-[linear-gradient(135deg,#ff6f61_0%,#163761_54%,#0f2341_100%)] text-white shadow-[0_18px_34px_rgba(15,35,65,0.28)]"
                  : "text-slate-300 hover:bg-white/8 hover:text-white"
              }`}
              href={item.href}
              key={item.href}
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border ${
                  active ? "border-white/16 bg-white/12" : "border-white/10 bg-white/6"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{item.label}</span>
                {item.description ? (
                  <span className={`block text-xs leading-5 ${active ? "text-white/78" : "text-slate-400"}`}>
                    {item.description}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100/60">{missionTitle}</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {missionDescription}
        </p>
      </div>
    </aside>
  );
}
