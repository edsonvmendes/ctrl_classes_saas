const timeFieldPattern = /^(\d{2}:\d{2})(?::\d{2})?$/;

export function normalizeTimeFieldValue(value: string) {
  const trimmedValue = value.trim();
  const matchedValue = trimmedValue.match(timeFieldPattern);

  return matchedValue ? matchedValue[1] : trimmedValue;
}

export function toTimeInputValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return normalizeTimeFieldValue(value);
}
