import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: number;
  theme?: "light" | "dark";
  variant?: "full" | "icon";
};

const brand = {
  accent: "#FF6F61",
  blueSoft: "#7BA3DB",
  navy: "#0F2341",
  white: "#FFFFFF",
};

export function Logo({
  className,
  size = 44,
  theme = "dark",
  variant = "full",
}: LogoProps) {
  const foreground = theme === "dark" ? brand.white : brand.navy;

  const icon = (
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 64 64"
      width={size}
    >
      <rect width="64" height="64" rx="16" fill={brand.navy} />
      <path
        d="M18 18 L12 32 L18 46"
        stroke={brand.blueSoft}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <path
        d="M46 18 L52 32 L46 46"
        stroke={brand.blueSoft}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <path
        d="M38 24 C38 24 34 20 28 20 C22 20 20 25 20 32 C20 39 22 44 28 44 C34 44 38 40 38 40"
        fill="none"
        stroke={brand.white}
        strokeLinecap="round"
        strokeWidth="4"
      />
      <line
        x1="42"
        x2="42"
        y1="22"
        y2="42"
        stroke={brand.accent}
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );

  if (variant === "icon") {
    return <div className={className}>{icon}</div>;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {icon}
      <div className="flex flex-col leading-none">
        <span
          className="font-mono text-xl font-bold tracking-tight"
          style={{ color: foreground }}
        >
          CTRL<span style={{ color: brand.accent }}>_</span>
        </span>
        <span
          className="text-sm font-semibold uppercase tracking-[0.2em]"
          style={{ color: theme === "dark" ? brand.blueSoft : brand.navy }}
        >
          Classes
        </span>
      </div>
    </div>
  );
}
