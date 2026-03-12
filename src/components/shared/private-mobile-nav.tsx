"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { privateNavIcons } from "@/components/shared/private-nav-icons";
import { getActiveNavItem, type NavItem } from "@/components/shared/private-nav-state";

type PrivateMobileNavProps = {
  items: NavItem[];
};

export function PrivateMobileNav({ items }: PrivateMobileNavProps) {
  const pathname = usePathname();
  const visibleItems = items.slice(0, 5);
  const activeItem = getActiveNavItem(pathname, visibleItems);

  return (
    <nav className="panel-soft fixed inset-x-3 bottom-3 z-40 rounded-[26px] px-2 py-2 lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {visibleItems.map((item) => {
          const active = activeItem?.href === item.href;
          const Icon = privateNavIcons[item.icon];

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center rounded-[18px] px-2 py-2.5 text-[11px] font-semibold transition ${
                active
                  ? "bg-[linear-gradient(135deg,#0f2341_0%,#163761_58%,#ff6f61_100%)] text-white shadow-[0_12px_24px_rgba(15,35,65,0.2)]"
                  : "text-slate-500 hover:bg-white hover:text-slate-950"
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
