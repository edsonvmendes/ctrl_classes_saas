import { describe, expect, it } from "vitest";

import {
  getCurrentMonthInTimeZone,
  getLocalDateKey,
  zonedLocalDateTimeToUtc,
} from "@/lib/datetime/timezone";

describe("timezone helpers", () => {
  it("converts Sao Paulo local time to UTC", () => {
    expect(
      zonedLocalDateTimeToUtc("2026-03-11", "14:00", "America/Sao_Paulo").toISOString(),
    ).toBe("2026-03-11T17:00:00.000Z");
  });

  it("handles DST-aware conversions for New York", () => {
    expect(
      zonedLocalDateTimeToUtc("2026-03-09", "09:00", "America/New_York").toISOString(),
    ).toBe("2026-03-09T13:00:00.000Z");
    expect(
      zonedLocalDateTimeToUtc("2026-11-02", "09:00", "America/New_York").toISOString(),
    ).toBe("2026-11-02T14:00:00.000Z");
  });

  it("returns the local date key in the requested timezone", () => {
    expect(getLocalDateKey(new Date("2026-03-11T02:30:00.000Z"), "America/Sao_Paulo")).toBe(
      "2026-03-10",
    );
  });

  it("returns the current month key in the requested timezone", () => {
    expect(getCurrentMonthInTimeZone("Pacific/Kiritimati")).toMatch(/^\d{4}-\d{2}$/);
  });
});
