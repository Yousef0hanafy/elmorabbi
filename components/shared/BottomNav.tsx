"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, MessageSquareQuote, Compass, UserCheck } from "lucide-react";

interface BottomNavProps {
  role: "student" | "sheikh" | "admin";
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  if (role === "student") {
    const items = [
      { href: "/student", label: "ورد اليوم", icon: CheckCircle2 },
      { href: "/student/sheikh", label: "توجيهات الشيخ", icon: MessageSquareQuote },
      { href: "/student/choose-sheikh", label: "اختيار الشيخ", icon: Compass },
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 shadow-lg">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-emerald-700 font-bold bg-emerald-50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  if (role === "sheikh") {
    const items = [
      { href: "/sheikh", label: "متابعة الطلاب", icon: UserCheck },
      { href: "/sheikh#inquiries", label: "استفسارات الطلاب", icon: MessageSquareQuote },
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 shadow-lg">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-amber-700 font-bold bg-amber-50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-amber-600" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return null;
}
