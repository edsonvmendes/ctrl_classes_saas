import { z } from "zod";

import { normalizeTimeFieldValue } from "@/lib/datetime/time-input";

const optionalText = z.string().trim().transform((value) => value || null);
const optionalDate = z.string().trim().transform((value) => value || null);
const optionalStudentId = z.string().trim().transform((value) => value || null);

const weekdaySchema = z
  .array(z.coerce.number().int().min(0).max(6))
  .min(1, "Select at least one weekday.")
  .transform((value) => Array.from(new Set(value)).sort((left, right) => left - right));

export const scheduleFormSchema = z
  .object({
    title: z.string().trim().min(2, "Title must have at least 2 characters."),
    subject: optionalText,
    timezone: z.string().trim().min(3, "Timezone is required."),
    student_id: optionalStudentId,
    starts_at_time: z.preprocess(
      (value) => (typeof value === "string" ? normalizeTimeFieldValue(value) : value),
      z.string().trim().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format."),
    ),
    duration_minutes: z.coerce
      .number()
      .int("Duration must be a whole number.")
      .min(15, "Duration must be at least 15 minutes.")
      .max(600, "Duration must be 600 minutes or less."),
    by_weekday: weekdaySchema,
    start_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date is required."),
    end_date: optionalDate,
    status: z.enum(["active", "paused", "ended"]),
    notes: optionalText,
  })
  .superRefine((values, ctx) => {
    if (values.end_date && values.end_date < values.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be before start date.",
        path: ["end_date"],
      });
    }
  });

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;
