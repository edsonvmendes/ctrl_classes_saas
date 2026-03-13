export type GodNavItem = {
  description?: string;
  href: string;
  icon: keyof typeof import("@/features/god/god-nav-icons").godNavIcons;
  label: string;
  shortLabel?: string;
};

export function isActiveGodPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveGodNavItem(pathname: string, items: GodNavItem[]) {
  return items.find((item) => isActiveGodPath(pathname, item.href)) ?? null;
}
