import { expect, type Page } from "@playwright/test";

type SubmitServerActionOptions = {
  buttonName: RegExp | string;
  expectedPath: string;
  responsePath: string;
  timeout?: number;
};

export async function submitServerActionAndEnsurePath(
  page: Page,
  { buttonName, expectedPath, responsePath, timeout = 60_000 }: SubmitServerActionOptions,
) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes(responsePath) &&
      response.status() === 303,
    { timeout },
  );

  await page.getByRole("button", { name: buttonName }).click();
  await responsePromise;

  if (!page.url().endsWith(expectedPath)) {
    await page.goto(expectedPath);
  }

  await expect.poll(() => page.url(), { timeout }).toContain(expectedPath);
}
