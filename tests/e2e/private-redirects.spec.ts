import { expect, test } from "@playwright/test";

const privateRoutes = [
  "/pt-BR/god",
  "/pt-BR/app",
  "/pt-BR/students",
  "/pt-BR/agenda",
  "/pt-BR/payments",
] as const;

for (const route of privateRoutes) {
  test(`redirects anonymous users from ${route} to login`, async ({ page }) => {
    await page.goto(route);

    await expect(page).toHaveURL(/\/pt-BR\/login$/);
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  });
}
