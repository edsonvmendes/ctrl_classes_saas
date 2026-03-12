import { describe, expect, it } from "vitest";

import { buildClassesFromSchedule } from "@/features/schedules/generation";

describe("buildClassesFromSchedule", () => {
  it("generates classes only for selected weekdays", () => {
    const result = buildClassesFromSchedule({
      partnerId: "partner-1",
      scheduleId: "schedule-1",
      values: {
        by_weekday: [1, 3],
        duration_minutes: 60,
        end_date: "2026-03-08",
        notes: null,
        start_date: "2026-03-02",
        starts_at_time: "10:00",
        status: "active",
        student_id: "student-1",
        subject: "Math",
        timezone: "America/Sao_Paulo",
        title: "Weekly Math",
      },
    });

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.student_id)).toEqual(["student-1", "student-1"]);
    expect(result.map((item) => item.title)).toEqual(["Weekly Math", "Weekly Math"]);
    expect(result[0]?.starts_at).toBe("2026-03-02T13:00:00.000Z");
    expect(result[1]?.starts_at).toBe("2026-03-04T13:00:00.000Z");
    expect(result[0]?.ends_at).toBe("2026-03-02T14:00:00.000Z");
  });

  it("does not generate classes when schedule is not active", () => {
    const result = buildClassesFromSchedule({
      partnerId: "partner-1",
      scheduleId: "schedule-1",
      values: {
        by_weekday: [1],
        duration_minutes: 60,
        end_date: "2026-03-31",
        notes: null,
        start_date: "2026-03-02",
        starts_at_time: "10:00",
        status: "paused",
        student_id: null,
        subject: null,
        timezone: "America/Sao_Paulo",
        title: "Paused",
      },
    });

    expect(result).toEqual([]);
  });

  it("caps generation to the default horizon when no end date is provided", () => {
    const result = buildClassesFromSchedule({
      partnerId: "partner-1",
      scheduleId: "schedule-1",
      values: {
        by_weekday: [1],
        duration_minutes: 60,
        end_date: null,
        notes: null,
        start_date: "2026-03-02",
        starts_at_time: "10:00",
        status: "active",
        student_id: null,
        subject: null,
        timezone: "America/Sao_Paulo",
        title: "Weekly horizon",
      },
    });

    expect(result).toHaveLength(13);
    expect(result.at(-1)?.starts_at).toBe("2026-05-25T13:00:00.000Z");
  });
});
