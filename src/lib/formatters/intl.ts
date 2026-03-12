function getDateOnlyValue(value: string) {
  const datePrefix = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];

  if (datePrefix) {
    return new Date(`${datePrefix}T12:00:00.000Z`);
  }

  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) {
    return null;
  }

  return parsedValue;
}

export function formatCurrencyFromCents(
  value: number | null,
  locale: string,
  currency: string,
) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat(locale, {
    currency,
    style: "currency",
  }).format(value / 100);
}

export function formatDateOnly(
  value: string,
  locale: string,
  timeZone?: string,
  options?: Intl.DateTimeFormatOptions,
) {
  const formatterOptions = options ?? { dateStyle: "medium" as const };
  const dateValue = getDateOnlyValue(value);

  if (!dateValue) {
    throw new RangeError(`Invalid date value: ${value}`);
  }

  return new Intl.DateTimeFormat(locale, {
    ...formatterOptions,
    timeZone,
  }).format(dateValue);
}

export function formatOptionalDateOnly(
  value: string | null | undefined,
  locale: string,
  timeZone?: string,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) {
    return "-";
  }

  const dateValue = getDateOnlyValue(value);

  if (!dateValue) {
    return "-";
  }

  const formatterOptions = options ?? { dateStyle: "medium" as const };

  return new Intl.DateTimeFormat(locale, {
    ...formatterOptions,
    timeZone,
  }).format(dateValue);
}

export function formatDateTimeInTimeZone(
  value: string,
  locale: string,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
    ...options,
  }).format(new Date(value));
}

export function formatMonthYear(value: string, locale: string, timeZone?: string) {
  return formatDateOnly(value, locale, timeZone, {
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(value: string, locale: string, timeZone: string) {
  return formatDateOnly(value, locale, timeZone, {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
}

export function formatTimeInTimeZone(value: string, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}

export function formatWeekdayLabel(value: string, locale: string, timeZone: string) {
  return formatDateOnly(value, locale, timeZone, {
    weekday: "short",
  });
}
