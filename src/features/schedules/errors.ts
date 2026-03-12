import type { ZodIssue } from "zod";

type ScheduleMessages = {
  errorDuration: string;
  errorEndDate: string;
  errorSave: string;
  errorStartDate: string;
  errorStartTime: string;
  errorTimezone: string;
  errorTitle: string;
  errorWeekdays: string;
  validationInvalid: string;
};

export function getScheduleValidationMessage(
  messages: ScheduleMessages,
  issue?: ZodIssue,
) {
  const fieldName = issue?.path[0];

  switch (fieldName) {
    case "title":
      return messages.errorTitle;
    case "timezone":
      return messages.errorTimezone;
    case "starts_at_time":
      return messages.errorStartTime;
    case "duration_minutes":
      return messages.errorDuration;
    case "by_weekday":
      return messages.errorWeekdays;
    case "start_date":
      return messages.errorStartDate;
    case "end_date":
      return messages.errorEndDate;
    default:
      return messages.validationInvalid;
  }
}
