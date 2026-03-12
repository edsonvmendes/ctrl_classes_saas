import { describe, expect, it } from "vitest";

import { getActiveNavItem, isActivePath, type NavItem } from "@/components/shared/private-nav-state";

const items: NavItem[] = [
  { href: "/pt-BR/app", label: "App" },
  { description: "Gerencie os alunos do tenant.", href: "/pt-BR/students", label: "Alunos" },
  { description: "Veja a agenda do periodo.", href: "/pt-BR/agenda", label: "Agenda" },
];

describe("private nav state", () => {
  it("matches exact app routes only for the dashboard item", () => {
    expect(isActivePath("/pt-BR/app", "/pt-BR/app")).toBe(true);
    expect(isActivePath("/pt-BR/app/overview", "/pt-BR/app")).toBe(false);
  });

  it("matches nested routes for other modules", () => {
    expect(isActivePath("/pt-BR/students/123/edit", "/pt-BR/students")).toBe(true);
    expect(isActivePath("/pt-BR/agenda/week", "/pt-BR/agenda")).toBe(true);
  });

  it("returns the active item so the UI can expose section context", () => {
    expect(getActiveNavItem("/pt-BR/students/new", items)).toEqual(items[1]);
    expect(getActiveNavItem("/pt-BR/unknown", items)).toBeNull();
  });
});
