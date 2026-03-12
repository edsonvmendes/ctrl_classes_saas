import { describe, expect, it } from "vitest";

import {
  canCancelClass,
  canRecordAttendance,
  mapAttendanceToClassStatus,
} from "@/features/classes/rules";

describe("classes rules", () => {
  it("maps attendance to class statuses", () => {
    expect(mapAttendanceToClassStatus("present")).toBe("completed");
    expect(mapAttendanceToClassStatus("late")).toBe("completed");
    expect(mapAttendanceToClassStatus("excused")).toBe("completed");
    expect(mapAttendanceToClassStatus("absent")).toBe("no_show");
  });

  it("allows cancellation only for scheduled classes", () => {
    expect(canCancelClass("scheduled")).toBe(true);
    expect(canCancelClass("completed")).toBe(false);
    expect(canCancelClass("cancelled")).toBe(false);
    expect(canCancelClass("no_show")).toBe(false);
  });

  it("allows attendance only for non-cancelled classes linked to a student", () => {
    expect(canRecordAttendance("scheduled", "student-1")).toBe(true);
    expect(canRecordAttendance("completed", "student-1")).toBe(true);
    expect(canRecordAttendance("no_show", "student-1")).toBe(true);
    expect(canRecordAttendance("cancelled", "student-1")).toBe(false);
    expect(canRecordAttendance("scheduled", null)).toBe(false);
  });
});
