import { describe, expect, it } from "vitest";

import {
  formatCurrencyFromCents,
  formatDateOnly,
  formatDateTimeInTimeZone,
  formatMonthYear,
  formatOptionalDateOnly,
} from "@/lib/formatters/intl";

describe("intl formatters", () => {
  it("formats cents using the requested locale and currency", () => {
    expect(formatCurrencyFromCents(12345, "en-US", "USD")).toBe("$123.45");
    expect(formatCurrencyFromCents(null, "en-US", "USD")).toBe("-");
  });

  it("anchors date-only values away from timezone drift", () => {
    expect(
      formatDateOnly("2026-03-01", "en-US", "America/Sao_Paulo", {
        day: "numeric",
        month: "numeric",
      }),
    ).toBe("3/1");
  });

  it("formats zoned date-time values consistently", () => {
    expect(
      formatDateTimeInTimeZone("2026-03-10T15:30:00.000Z", "en-US", "America/Sao_Paulo"),
    ).toContain("12:30");
  });

  it("formats month labels from yyyy-mm values", () => {
    expect(formatMonthYear("2026-03-01", "en-US")).toBe("March 2026");
  });

  it("accepts iso timestamps when only the date label matters", () => {
    expect(formatOptionalDateOnly("2026-03-10T15:30:00.000Z", "en-US")).toBe("Mar 10, 2026");
  });

  it("returns a safe fallback for invalid optional date values", () => {
    expect(formatOptionalDateOnly("not-a-date", "en-US")).toBe("-");
    expect(formatOptionalDateOnly(null, "en-US")).toBe("-");
  });
});
