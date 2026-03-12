import { describe, expect, it } from "vitest";

import { normalizeTimeFieldValue, toTimeInputValue } from "@/lib/datetime/time-input";

describe("time input helpers", () => {
  it("keeps hour and minute values untouched", () => {
    expect(normalizeTimeFieldValue("20:00")).toBe("20:00");
  });

  it("normalizes values that include seconds", () => {
    expect(normalizeTimeFieldValue("20:00:00")).toBe("20:00");
  });

  it("prepares database time values for time inputs", () => {
    expect(toTimeInputValue("20:00:00")).toBe("20:00");
    expect(toTimeInputValue(null)).toBe("");
  });
});
