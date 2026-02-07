import { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "primary";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-solar-green/10 text-solar-green",
  warning: "bg-solar-yellow/10 text-solar-yellow",
  error: "bg-heatpump-red/10 text-heatpump-red",
  info: "bg-climate-blue/10 text-climate-blue",
  primary: "bg-primary/10 text-primary",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
  lg: "px-2.5 py-1 text-sm",
};

export function Badge({ children, variant = "default", size = "md", dot, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-semibold rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "success" ? "bg-solar-green" :
            variant === "warning" ? "bg-solar-yellow" :
            variant === "error" ? "bg-heatpump-red" :
            variant === "info" ? "bg-climate-blue" :
            variant === "primary" ? "bg-primary" :
            "bg-gray-400"
          }`}
        />
      )}
      {children}
    </span>
  );
}

export type { BadgeProps, BadgeVariant, BadgeSize };
