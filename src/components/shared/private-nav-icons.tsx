import {
  CalendarDays,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Repeat2,
  Settings2,
  Sparkles,
} from "lucide-react";

export const privateNavIcons = {
  agenda: CalendarDays,
  app: LayoutDashboard,
  onboarding: Sparkles,
  payments: CreditCard,
  schedules: Repeat2,
  settings: Settings2,
  students: GraduationCap,
} as const;
