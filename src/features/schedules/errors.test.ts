import { describe, expect, it } from "vitest";

import { getScheduleValidationMessage } from "@/features/schedules/errors";

const messages = {
  errorDuration: "Duration",
  errorEndDate: "End date",
  errorSave: "Save",
  errorStartDate: "Start date",
  errorStartTime: "Start time",
  errorTimezone: "Timezone",
  errorTitle: "Title",
  errorWeekdays: "Weekdays",
  validationInvalid: "Invalid",
};

describe("schedule validation messages", () => {
  it("maps the time field to a product-facing message", () => {
    expect(
      getScheduleValidationMessage(messages, {
        code: "invalid_format",
        format: "regex",
        input: "20:00:00",
        message: "Start time must be in HH:MM format.",
        path: ["starts_at_time"],
        pattern: "",
      }),
    ).toBe("Start time");
  });

  it("falls back to the generic schedule message", () => {
    expect(getScheduleValidationMessage(messages)).toBe("Invalid");
  });
});
