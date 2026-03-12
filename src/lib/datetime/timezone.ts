function getFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const formatter = getFormatter(timeZone);
  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const utcFromZone = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return utcFromZone - date.getTime();
}

export function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    day: values.day,
    month: values.month,
    year: values.year,
  };
}

export function zonedLocalDateTimeToUtc(
  localDate: string,
  localTime: string,
  timeZone: string,
) {
  const [year, month, day] = localDate.split("-").map(Number);
  const [hour, minute, second = 0] = localTime.split(":").map(Number);

  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const firstOffset = getTimeZoneOffsetMs(guess, timeZone);
  const candidate = new Date(guess.getTime() - firstOffset);
  const secondOffset = getTimeZoneOffsetMs(candidate, timeZone);

  if (secondOffset === firstOffset) {
    return candidate;
  }

  return new Date(guess.getTime() - secondOffset);
}

export function getTodayInTimeZone(timeZone: string) {
  const parts = getDatePartsInTimeZone(new Date(), timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getCurrentMonthInTimeZone(timeZone: string) {
  const parts = getDatePartsInTimeZone(new Date(), timeZone);
  return `${parts.year}-${parts.month}`;
}

export function shiftIsoDate(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getLocalDateKey(date: Date, timeZone: string) {
  const parts = getDatePartsInTimeZone(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatTimeRange(time: string, durationMinutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const endMinutes = hour * 60 + minute + durationMinutes;
  const endHour = Math.floor(endMinutes / 60) % 24;
  const endMinute = endMinutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} - ${String(
    endHour,
  ).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
}
