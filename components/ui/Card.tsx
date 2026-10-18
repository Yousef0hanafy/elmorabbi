import type { ComponentProps, ComponentType, ReactNode } from "react";

export function Card({ className = "", ...props }: ComponentProps<"section">) {
  return (
    <section
      className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm ${className}`}
      {...props}
    />
  );
}

interface CardHeaderProps {
  icon: ComponentType<{ className?: string }>;
  // Tailwind classes for the icon tile, e.g. "bg-emerald-100 text-emerald-800"
  iconClassName?: string;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({
  icon: Icon,
  iconClassName = "bg-emerald-100 text-emerald-800",
  title,
  subtitle,
  action,
}: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClassName}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
