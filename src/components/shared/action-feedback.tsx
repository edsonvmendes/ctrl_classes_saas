"use client";

type ActionFeedbackProps = {
  className?: string;
  message?: string;
  tone: "error" | "success" | "warning";
};

function getToneClassName(tone: ActionFeedbackProps["tone"]) {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-red-200 bg-red-50 text-red-600";
}

export function ActionFeedback({
  className = "",
  message,
  tone,
}: ActionFeedbackProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className={`rounded-[22px] border px-4 py-3 text-sm ${getToneClassName(tone)} ${className}`.trim()}
      role={tone === "error" ? "alert" : "status"}
    >
      {message}
    </p>
  );
}
