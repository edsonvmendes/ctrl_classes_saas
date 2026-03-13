"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { godNavIcons } from "@/features/god/god-nav-icons";
import { getActiveGodNavItem, type GodNavItem } from "@/features/god/god-nav-state";

type GodMobileNavProps = {
  items: GodNavItem[];
};

export function GodMobileNav({ items }: GodMobileNavProps) {
  const pathname = usePathname();
  const visibleItems = items.slice(0, 3);
  const activeItem = getActiveGodNavItem(pathname, visibleItems);

  return (
    <nav className="surface-ink fixed inset-x-3 bottom-3 z-40 rounded-[26px] px-2 py-2 text-white lg:hidden">
      <div className="grid grid-cols-3 gap-1">
        {visibleItems.map((item) => {
          const active = activeItem?.href === item.href;
          const Icon = godNavIcons[item.icon];

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center rounded-[18px] px-2 py-2.5 text-[11px] font-semibold transition ${
                active
                  ? "bg-[linear-gradient(135deg,#ff6f61_0%,#163761_54%,#0f2341_100%)] text-white shadow-[0_12px_24px_rgba(15,35,65,0.24)]"
                  : "text-slate-300 hover:bg-white/8 hover:text-white"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="mb-1 h-4 w-4" />
              <span className="truncate">{item.shortLabel ?? item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
