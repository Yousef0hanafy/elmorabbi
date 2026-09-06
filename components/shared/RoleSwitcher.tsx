"use client";

import { useTransition } from "react";
import { switchDemoUserAction } from "@/lib/actions/auth-actions";
import { UserCheck, Shield, GraduationCap } from "lucide-react";

interface RoleSwitcherProps {
  currentUserId: string;
  currentRole: string;
}

export function RoleSwitcher({ currentUserId, currentRole }: RoleSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (userId: string) => {
    startTransition(async () => {
      await switchDemoUserAction(userId);
    });
  };

  return (
    <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/20 rounded-full p-1 text-xs">
      <span className="text-emerald-300 font-medium px-2 hidden sm:inline">
        تبديل الدور للتجربة:
      </span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleSwitch("student-ahmed")}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
          currentUserId === "student-ahmed"
            ? "bg-emerald-600 text-white font-semibold shadow-sm"
            : "text-emerald-200 hover:bg-emerald-900/50"
        }`}
      >
        <GraduationCap className="w-3.5 h-3.5" />
        <span>طالب (أحمد)</span>
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => handleSwitch("sheikh-mahmoud")}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
          currentUserId === "sheikh-mahmoud"
            ? "bg-amber-600 text-white font-semibold shadow-sm"
            : "text-amber-200 hover:bg-amber-950/50"
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span>الشيخ (محمود)</span>
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => handleSwitch("admin-root")}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
          currentUserId === "admin-root"
            ? "bg-slate-700 text-white font-semibold shadow-sm"
            : "text-slate-300 hover:bg-slate-800/50"
        }`}
      >
        <Shield className="w-3.5 h-3.5" />
        <span>المشرف</span>
      </button>
    </div>
  );
}
