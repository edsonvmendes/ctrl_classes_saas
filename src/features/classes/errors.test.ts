import { describe, expect, it } from "vitest";

import { getManualClassValidationMessage } from "@/features/classes/errors";

const messages = {
  errorClassDate: "Class date",
  errorCreate: "Create",
  errorDuration: "Duration",
  errorStartTime: "Start time",
  errorTimezone: "Timezone",
  errorTitle: "Title",
  validationInvalid: "Invalid",
};

describe("manual class validation messages", () => {
  it("maps the time field to a product-facing message", () => {
    expect(
      getManualClassValidationMessage(messages, {
        code: "invalid_format",
        format: "regex",
        input: "20:00:00",
        message: "Start time must be in HH:MM format.",
        path: ["starts_at_time"],
        pattern: "",
      }),
    ).toBe("Start time");
  });

  it("falls back to the generic class message", () => {
    expect(getManualClassValidationMessage(messages)).toBe("Invalid");
  });
});
