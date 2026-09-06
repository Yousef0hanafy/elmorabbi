"use client";

import { Flame, CheckCircle, Award } from "lucide-react";

interface TodayProgressProps {
  completedDeeds: number;
  totalDeeds: number;
  streakDays: number;
  studentName: string;
}

export function TodayProgress({
  completedDeeds,
  totalDeeds,
  streakDays,
  studentName,
}: TodayProgressProps) {
  const percentage = Math.round((completedDeeds / totalDeeds) * 100);

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background Islamic geometric accent */}
      <div className="absolute -top-10 -left-10 w-44 h-44 bg-emerald-700/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-700/50 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-medium text-emerald-200 mb-3">
            <span>ورد اليوم المبارك</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
            مرحباً بك، {studentName}
          </h1>

          <p className="text-emerald-100/80 text-sm max-w-xl font-quran leading-relaxed">
            قال رسول الله ﷺ: «أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ». حافظ على استقامتك اليوم وداوم على وردك.
          </p>
        </div>

        {/* Progress & Streak Stats */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Streak Badge */}
          <div className="bg-emerald-950/60 border border-amber-500/30 rounded-xl p-3.5 flex items-center gap-3 shadow-inner">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-emerald-950 shadow-md">
              <Flame className="w-5 h-5 text-emerald-950 fill-emerald-950" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-amber-300 leading-none">
                {streakDays} يوماً
              </div>
              <div className="text-[11px] text-emerald-200/90 font-medium mt-0.5">
                سلسلة الاستقامة
              </div>
            </div>
          </div>

          {/* Today's completion ring / percentage */}
          <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3.5 flex items-center gap-3 shadow-inner">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {percentage}%
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-100 leading-none">
                {completedDeeds} / {totalDeeds}
              </div>
              <div className="text-[11px] text-emerald-200/90 font-medium mt-0.5">
                عبادات منجزة اليوم
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 relative">
        <div className="w-full bg-emerald-950/70 rounded-full h-2.5 overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-emerald-200/80 mt-1.5 font-medium">
          <span>البداية</span>
          <span>{percentage === 100 ? "ما شاء الله! أتممت كافة واجبات اليوم" : `${100 - percentage}% متبقية لاكتمال ورد اليوم`}</span>
          <span>١٠٠٪ الورد التام</span>
        </div>
      </div>
    </div>
  );
}
