import { expect, test } from "@playwright/test";

import { submitServerActionAndEnsurePath } from "./helpers/actions";
import { hasE2ECredentials, loginAsTestUser } from "./helpers/auth";
import { cleanupE2EData } from "./helpers/data";

const transitionTimeout = 60_000;

test.describe("authenticated flows", () => {
  test.skip(!hasE2ECredentials(), "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run authenticated flows.");
  test.describe.configure({ mode: "serial" });
  test.setTimeout(90_000);
  const runId = Date.now();
  const studentName = `E2E Student ${runId}`;
  const scheduleTitle = `E2E Schedule ${runId}`;
  const manualClassTitle = `E2E Manual Class ${runId}`;

  test.beforeAll(async () => {
    await cleanupE2EData();
  });

  test.afterAll(async () => {
    await cleanupE2EData();
  });

  test("creates a monthly student", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/pt-BR/students/new");

    await page.locator('input[name="full_name"]').fill(studentName);
    await page.locator('input[name="email"]').fill(`e2e+${runId}@example.com`);
    await page.locator('input[name="monthly_amount"]').fill("250");
    await page.locator('input[name="billing_day_of_month"]').fill("10");
    await submitServerActionAndEnsurePath(page, {
      buttonName: "Criar aluno",
      expectedPath: "/pt-BR/students",
      responsePath: "/pt-BR/students/new",
      timeout: transitionTimeout,
    });

    await expect(page.locator("article:visible").filter({ hasText: studentName }).first()).toBeVisible();
  });

  test("creates a recurring schedule", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/pt-BR/schedules/new");

    await page.locator('input[name="title"]').fill(scheduleTitle);
    await page.locator('input[name="starts_at_time"]').fill("10:00");
    await page.locator('input[name="duration_minutes"]').fill("60");
    await page.locator('input[name="start_date"]').fill("2026-03-09");
    await page.locator('input[name="by_weekday"][value="1"]').check();
    await submitServerActionAndEnsurePath(page, {
      buttonName: "Salvar recorrencia",
      expectedPath: "/pt-BR/schedules",
      responsePath: "/pt-BR/schedules/new",
      timeout: transitionTimeout,
    });

    await expect(page.locator("article:visible").filter({ hasText: scheduleTitle }).first()).toBeVisible();
  });

  test("creates a manual class linked to the test student", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/pt-BR/agenda/new");
    const classDate = await page.locator('input[name="class_date"]').inputValue();

    await page.locator('input[name="title"]').fill(manualClassTitle);
    await page.locator('select[name="student_id"]').selectOption({ label: studentName });
    await page.locator('input[name="starts_at_time"]').fill("14:00");
    await page.locator('input[name="duration_minutes"]').fill("60");
    await page.getByRole("button", { name: "Criar aula" }).click();

    await expect(page.getByRole("button", { name: "Salvando..." })).toBeDisabled();
    await page.waitForTimeout(1500);
    await page.goto(`/pt-BR/agenda?date=${classDate}&view=day`);
    await expect(page.locator("article:visible").filter({ hasText: manualClassTitle }).first()).toBeVisible();
    await expect(page.locator("article:visible").filter({ hasText: studentName }).first()).toBeVisible();
  });

  test("records attendance for the manual class", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/pt-BR/agenda?view=day");
    const currentAgendaUrl = page.url();

    const classCard = page.locator("article").filter({ hasText: manualClassTitle }).first();

    await expect(classCard).toBeVisible();
    await classCard.getByRole("button", { name: "Presente" }).click();
    await page.waitForTimeout(1500);
    await page.goto(currentAgendaUrl);

    const refreshedCard = page.locator("article:visible").filter({ hasText: manualClassTitle }).first();

    await expect(refreshedCard).toContainText(/Presen.*registrada: Presente/i);
    await expect(refreshedCard).toContainText(/Conclu/i);
  });

  test("generates monthly payments for the test student", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/pt-BR/payments");

    await page
      .getByTestId("payments-generate-primary")
      .getByRole("button", { name: /Gerar cobran/ })
      .click();
    await expect(
      page.locator("article:visible").filter({ hasText: studentName }).first(),
    ).toBeVisible({ timeout: transitionTimeout });
  });

  test("settles the generated monthly payment", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/pt-BR/payments");

    const paymentRow = page
      .getByText(studentName)
      .locator("xpath=ancestor::div[.//p[normalize-space()='Valor'] and .//p[normalize-space()='Status']][1]");

    await expect(paymentRow).toBeVisible();
    await paymentRow.getByRole("button", { name: "Registrar pagamento" }).click();
    await page.waitForLoadState("networkidle");

    const refreshedPaymentRow = page
      .getByText(studentName)
      .locator("xpath=ancestor::div[.//p[normalize-space()='Valor'] and .//p[normalize-space()='Status']][1]");

    await expect(refreshedPaymentRow.getByText("Pago")).toBeVisible({ timeout: transitionTimeout });
    await expect(refreshedPaymentRow.getByRole("button", { name: "Registrar pagamento" })).toHaveCount(0, {
      timeout: transitionTimeout,
    });
  });

  test("renders subscription and readiness in settings", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/pt-BR/settings");

    await expect(page.getByRole("heading", { name: "Assinatura" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Configuração do sistema" })).toBeVisible();
    await expect(page.getByText("Link de diagnóstico:")).toBeVisible();
    await expect(page.getByText("/api/health")).toBeVisible();
    await expect(page.getByText("Acesso com Google")).toBeVisible();
    await expect(page.getByText("Links importantes")).toBeVisible();
  });
});
