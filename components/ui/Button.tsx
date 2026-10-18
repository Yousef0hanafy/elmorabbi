import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-700/20",
  accent: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
  danger: "bg-rose-600 hover:bg-rose-700 text-white",
};

// Every size keeps at least a 36px (sm) / 44px (md, lg) touch target
const SIZES: Record<Size, string> = {
  sm: "min-h-9 px-3 text-xs rounded-lg",
  md: "min-h-11 px-4 text-sm rounded-xl",
  lg: "min-h-12 px-6 text-base rounded-2xl",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className = ""): string {
  return `inline-flex items-center justify-center gap-2 font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
