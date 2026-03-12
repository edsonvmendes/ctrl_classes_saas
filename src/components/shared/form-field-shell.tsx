import type { ReactNode } from "react";

type FormFieldShellProps = {
  children: ReactNode;
  description?: string;
  icon?: ReactNode;
  label: string;
};

export function FormFieldShell({
  children,
  description,
  icon,
  label,
}: FormFieldShellProps) {
  return (
    <label className="space-y-2.5">
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon}
        {label}
      </span>
      {children}
      {description ? <span className="block text-sm leading-6 text-slate-500">{description}</span> : null}
    </label>
  );
}
