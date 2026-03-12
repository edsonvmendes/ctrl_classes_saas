import { z } from "zod";

import { normalizeTimeFieldValue } from "@/lib/datetime/time-input";

const optionalText = z.string().trim().transform((value) => value || null);
const optionalStudentId = z.string().trim().transform((value) => value || null);

export const manualClassFormSchema = z.object({
  title: z.string().trim().min(2, "Title must have at least 2 characters."),
  subject: optionalText,
  timezone: z.string().trim().min(3, "Timezone is required."),
  student_id: optionalStudentId,
  class_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Class date is required."),
  starts_at_time: z.preprocess(
    (value) => (typeof value === "string" ? normalizeTimeFieldValue(value) : value),
    z.string().trim().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format."),
  ),
  duration_minutes: z.coerce
    .number()
    .int("Duration must be a whole number.")
    .min(15, "Duration must be at least 15 minutes.")
    .max(600, "Duration must be 600 minutes or less."),
  notes: optionalText,
});

export type ManualClassFormValues = z.infer<typeof manualClassFormSchema>;
