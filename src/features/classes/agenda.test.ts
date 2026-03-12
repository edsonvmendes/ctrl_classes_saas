import { describe, expect, it } from "vitest";

import { buildAgendaUrl, getViewRange } from "@/features/classes/agenda";

describe("classes agenda helpers", () => {
  it("builds agenda URLs with filters only when needed", () => {
    expect(buildAgendaUrl("pt-BR", "2026-03-07", "all", "day")).toBe(
      "/pt-BR/agenda?date=2026-03-07&view=day",
    );
    expect(buildAgendaUrl("pt-BR", "2026-03-07", "scheduled", "week")).toBe(
      "/pt-BR/agenda?date=2026-03-07&view=week&status=scheduled",
    );
  });

  it("builds week ranges anchored on monday", () => {
    const result = getViewRange("week", "2026-03-08");

    expect(result.periodStart).toBe("2026-03-02");
    expect(result.gridStart).toBe("2026-03-02");
    expect(result.previousDate).toBe("2026-02-23");
    expect(result.nextDate).toBe("2026-03-09");
    expect(result.gridTotalDays).toBe(7);
  });

  it("builds month ranges with a six-week grid", () => {
    const result = getViewRange("month", "2026-03-18");

    expect(result.periodStart).toBe("2026-03-01");
    expect(result.gridStart).toBe("2026-02-23");
    expect(result.previousDate).toBe("2026-02-01");
    expect(result.nextDate).toBe("2026-04-01");
    expect(result.periodEndExclusive).toBe("2026-04-06");
    expect(result.gridTotalDays).toBe(42);
  });

  it("builds day ranges one day at a time", () => {
    const result = getViewRange("day", "2026-03-18");

    expect(result.periodStart).toBe("2026-03-18");
    expect(result.previousDate).toBe("2026-03-17");
    expect(result.nextDate).toBe("2026-03-19");
    expect(result.gridTotalDays).toBe(1);
  });
});
