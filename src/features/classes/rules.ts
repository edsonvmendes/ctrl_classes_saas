import type { AttendanceStatus, ClassStatus } from "@/types/schedule";

export function canCancelClass(status: ClassStatus) {
  return status === "scheduled";
}

export function canRecordAttendance(status: ClassStatus, studentId: string | null) {
  return Boolean(studentId) && status !== "cancelled";
}

export function mapAttendanceToClassStatus(status: AttendanceStatus): ClassStatus {
  if (status === "absent") {
    return "no_show";
  }

  return "completed";
}
