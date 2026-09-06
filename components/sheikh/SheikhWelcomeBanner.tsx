"use client";

import { useState } from "react";
import { Sparkles, Megaphone, Users } from "lucide-react";
import { BroadcastMessageDialog } from "./BroadcastMessageDialog";

interface SheikhWelcomeBannerProps {
  sheikhName: string;
  halaqahName: string;
  totalStudents: number;
}

export function SheikhWelcomeBanner({
  sheikhName,
  halaqahName,
  totalStudents,
}: SheikhWelcomeBannerProps) {
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Background Decorative Glow */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Welcome Text */}
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>لوحة متابعة وإشراف الشيخ</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {halaqahName}
          </h1>

          <p className="text-amber-200/90 text-xs sm:text-sm font-quran max-w-xl leading-relaxed">
            «كُلُّكُمْ رَاعٍ وَكُلُّكُمْ مَسْؤولٌ عَنْ رَعِيَّتِهِ». تابع التزام طلابك يوماً بيوم، ووجّه من يحتاج للتثبيت والمناصحة.
          </p>
        </div>

        {/* Collective Action */}
        <div className="flex items-center gap-3 relative z-10 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setBroadcastOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Megaphone className="w-4 h-4 text-slate-950" />
            <span>إرسال توجيه عام لطلاب الحلقة</span>
          </button>
        </div>
      </div>

      <BroadcastMessageDialog
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        totalStudents={totalStudents}
      />
    </>
  );
}
