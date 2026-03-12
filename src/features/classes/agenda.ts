export type AgendaView = "day" | "week" | "month";

function parseIsoDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function formatLocalDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function startOfWeek(isoDate: string) {
  const date = parseIsoDate(isoDate);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return formatLocalDate(addUtcDays(date, diff));
}

function firstDayOfMonth(isoDate: string) {
  return `${isoDate.slice(0, 7)}-01`;
}

function firstDayOfNextMonth(isoDate: string) {
  const [year, month] = isoDate.slice(0, 7).split("-").map(Number);
  const next =
    month === 12 ? new Date(Date.UTC(year + 1, 0, 1)) : new Date(Date.UTC(year, month, 1));
  return formatLocalDate(next);
}

function firstDayOfPreviousMonth(isoDate: string) {
  const [year, month] = isoDate.slice(0, 7).split("-").map(Number);
  const previous =
    month === 1 ? new Date(Date.UTC(year - 1, 11, 1)) : new Date(Date.UTC(year, month - 2, 1));
  return formatLocalDate(previous);
}

export function buildAgendaUrl(
  locale: string,
  date: string,
  status: string,
  view: AgendaView,
) {
  const params = new URLSearchParams();
  params.set("date", date);
  params.set("view", view);

  if (status !== "all") {
    params.set("status", status);
  }

  return `/${locale}/agenda?${params.toString()}`;
}

export function getViewRange(view: AgendaView, selectedDate: string) {
  if (view === "day") {
    return {
      gridStart: selectedDate,
      gridTotalDays: 1,
      nextDate: shiftIsoDate(selectedDate, 1),
      periodEndExclusive: shiftIsoDate(selectedDate, 1),
      periodStart: selectedDate,
      previousDate: shiftIsoDate(selectedDate, -1),
      selectedAnchor: selectedDate,
    };
  }

  if (view === "week") {
    const periodStart = startOfWeek(selectedDate);

    return {
      gridStart: periodStart,
      gridTotalDays: 7,
      nextDate: shiftIsoDate(periodStart, 7),
      periodEndExclusive: shiftIsoDate(periodStart, 7),
      periodStart,
      previousDate: shiftIsoDate(periodStart, -7),
      selectedAnchor: periodStart,
    };
  }

  const monthStart = firstDayOfMonth(selectedDate);
  const gridStart = startOfWeek(monthStart);

  return {
    gridStart,
    gridTotalDays: 42,
    nextDate: firstDayOfNextMonth(monthStart),
    periodEndExclusive: shiftIsoDate(gridStart, 42),
    periodStart: monthStart,
    previousDate: firstDayOfPreviousMonth(monthStart),
    selectedAnchor: monthStart,
  };
}

function shiftIsoDate(value: string, days: number) {
  const date = parseIsoDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return formatLocalDate(date);
}
