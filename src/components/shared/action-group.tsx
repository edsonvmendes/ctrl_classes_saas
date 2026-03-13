import type { ReactNode } from "react";

type ActionGroupProps = {
  children: ReactNode;
  compact?: boolean;
};

export function ActionGroup({ children, compact = false }: ActionGroupProps) {
  return (
    <div
      className={`flex w-full flex-wrap items-center ${
        compact ? "gap-2" : "gap-3"
      }`}
    >
      {children}
    </div>
  );
}
