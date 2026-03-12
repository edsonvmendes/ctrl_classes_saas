export type NavItem = {
  description?: string;
  href: string;
  icon: keyof typeof import("@/components/shared/private-nav-icons").privateNavIcons;
  label: string;
  shortLabel?: string;
};

export function isActivePath(pathname: string, href: string) {
  if (href.endsWith("/app")) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveNavItem(pathname: string, items: NavItem[]) {
  return items.find((item) => isActivePath(pathname, item.href)) ?? null;
}
