import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold",
    danger: "bg-rose-50 text-rose-700 border border-rose-200/60 font-semibold",
    info: "bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold",
    outline: "border border-slate-300 text-slate-600 bg-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
