import type { ZodIssue } from "zod";

type ManualClassMessages = {
  errorClassDate: string;
  errorCreate: string;
  errorDuration: string;
  errorStartTime: string;
  errorTimezone: string;
  errorTitle: string;
  validationInvalid: string;
};

export function getManualClassValidationMessage(
  messages: ManualClassMessages,
  issue?: ZodIssue,
) {
  const fieldName = issue?.path[0];

  switch (fieldName) {
    case "title":
      return messages.errorTitle;
    case "timezone":
      return messages.errorTimezone;
    case "class_date":
      return messages.errorClassDate;
    case "starts_at_time":
      return messages.errorStartTime;
    case "duration_minutes":
      return messages.errorDuration;
    default:
      return messages.validationInvalid;
  }
}
