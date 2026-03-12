import { describe, expect, it } from "vitest";

import { getFeedbackCopy } from "@/lib/i18n/feedback-copy";

describe("feedback copy", () => {
  it("returns localized labels for a supported locale", () => {
    expect(getFeedbackCopy("en-US")).toMatchObject({
      appCta: "Back to app",
      loadingEyebrow: "Opening your account",
      notFoundTitle: "Page not found.",
    });
  });

  it("falls back to the default locale for unsupported locales", () => {
    expect(getFeedbackCopy("fr-FR")).toMatchObject({
      appCta: "Voltar para o app",
      loadingEyebrow: "Abrindo sua conta",
      notFoundEyebrow: "Rota indisponível",
    });
  });
});
