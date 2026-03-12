import { expect, test } from "@playwright/test";

test("home page renders localized CTAs", async ({ page }) => {
  await page.goto("/pt-BR");

  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar conta" })).toBeVisible();
  await expect(page.getByText(/Cadastre alunos, acompanhe aulas/)).toBeVisible();
});

test("login page renders auth entry points", async ({ page }) => {
  await page.goto("/pt-BR/login");

  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar com Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
});
