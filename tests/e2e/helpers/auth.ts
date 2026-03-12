import { expect, type Page } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

export function hasE2ECredentials() {
  return Boolean(email && password);
}

export async function loginAsTestUser(page: Page) {
  if (!email || !password) {
    throw new Error("Missing E2E_TEST_EMAIL or E2E_TEST_PASSWORD.");
  }

  await page.goto("/pt-BR/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect.poll(() => page.url(), { timeout: 30_000 }).toMatch(/\/pt-BR\/(app|onboarding|settings)/);

  if (page.url().includes("/settings?billing=required")) {
    throw new Error("Test user is blocked by billing. Resolve subscription before running authenticated E2E.");
  }

  if (page.url().includes("/onboarding")) {
    await page.getByRole("button", { name: "Concluir onboarding" }).click();
    await expect.poll(() => page.url(), { timeout: 30_000 }).toMatch(/\/pt-BR\/app$/);
  }

  await expect(page).toHaveURL(/\/pt-BR\/app$/);
}
