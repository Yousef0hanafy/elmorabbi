import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
  isLight?: boolean;
  asLink?: boolean;
}

export function Logo({
  size = "md",
  showText = true,
  showSubtitle = true,
  subtitle = "متابعة العبادات ومرافقة الشيخ",
  className = "",
  isLight = true,
  asLink = true,
}: LogoProps) {
  const sizeMap = {
    sm: { container: "w-8 h-8 rounded-lg", img: 32, text: "text-base", sub: "text-[10px]" },
    md: { container: "w-10 h-10 rounded-xl", img: 40, text: "text-lg", sub: "text-[11px]" },
    lg: { container: "w-14 h-14 rounded-2xl", img: 56, text: "text-xl", sub: "text-xs" },
    xl: { container: "w-20 h-20 rounded-3xl", img: 80, text: "text-2xl sm:text-3xl", sub: "text-sm" },
  };

  const { container, img, text, sub } = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Logo Icon Badge */}
      <div
        className={`relative ${container} overflow-hidden bg-white p-0.5 border-2 border-amber-400/40 shadow-md shadow-amber-500/10 group-hover:border-amber-400 group-hover:scale-105 transition-all duration-300 shrink-0`}
      >
        <Image
          src="/logo.jpg"
          alt="شعار منصة المربي - مصحف النماء والتزكية"
          width={img}
          height={img}
          className="w-full h-full object-cover rounded-inherit"
          priority
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-bold ${text} tracking-tight leading-tight ${
              isLight ? "text-emerald-50" : "text-slate-900"
            }`}
          >
            منصة المربي
          </span>

          {showSubtitle && (
            <span
              className={`${sub} font-quran ${
                isLight ? "text-emerald-200/80" : "text-slate-500"
              } hidden sm:inline mt-0.5`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
