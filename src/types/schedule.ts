export type ScheduleStatus = "active" | "paused" | "ended";
export type ClassStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type ClassSource = "schedule" | "manual";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type ScheduleRecord = {
  id: string;
  student_id: string | null;
  title: string;
  subject: string | null;
  timezone: string;
  starts_at_time: string;
  duration_minutes: number;
  by_weekday: number[];
  start_date: string;
  end_date: string | null;
  status: ScheduleStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ScheduleListItem = ScheduleRecord & {
  student_name: string | null;
  generated_classes_count: number;
};

export type ClassRecord = {
  id: string;
  schedule_id: string | null;
  student_id: string | null;
  title: string;
  subject: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  status: ClassStatus;
  source: ClassSource;
  notes?: string | null;
  cancelled_at?: string | null;
  cancelled_reason?: string | null;
  student_name?: string | null;
  attendance_status?: AttendanceStatus | null;
  attendance_recorded_at?: string | null;
  attendance_notes?: string | null;
};
