"use client";

import { useState } from "react";
import { TrendingUp, Award, Flame, CheckCircle2 } from "lucide-react";
import type { DailyLogRecord } from "@/lib/data-service";
import { formatDay, todayDateString } from "@/lib/dates";
import { completionRate, countCompletedDeeds } from "@/lib/scoring";
import { FASTING_LABELS, PRAYER_STATUS_LABELS } from "@/lib/labels";

interface WeeklyProgressChartProps {
  history: DailyLogRecord[];
}

export function WeeklyProgressChart({ history }: WeeklyProgressChartProps) {
  const [selectedDay, setSelectedDay] = useState<DailyLogRecord | null>(null);

  // Compute stats across the available history
  const today = todayDateString();
  const dayData = history.map((log) => ({
    log,
    deeds: countCompletedDeeds(log),
    percent: completionRate(log),
    dayName: formatDay(log.date, { weekday: "short" }),
    isToday: log.date === today,
  }));

  const totalDays = history.length || 1;
  const totalQuranPages = history.reduce((acc, log) => acc + (log.quranPages || 0), 0);
  const fajrCongregationCount = history.filter((log) => log.fajr === "congregation").length;
  const avgCompletion = Math.round(dayData.reduce((acc, d) => acc + d.percent, 0) / totalDays);

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">مؤشر الالتزام الأسبوعي</h3>
            <p className="text-xs text-gray-500">معدل أدائك للأوراد والصلوات خلال آخر 7 أيام</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-emerald-600" />
            {avgCompletion}% معدل الأسبوع
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-3 border border-emerald-100 flex flex-col items-center text-center">
          <div className="text-emerald-700 font-extrabold text-lg sm:text-xl">
            {avgCompletion}%
          </div>
          <div className="text-[11px] font-medium text-emerald-900 mt-0.5">
            المواظبة العامة
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-2xl p-3 border border-amber-100 flex flex-col items-center text-center">
          <div className="text-amber-700 font-extrabold text-lg sm:text-xl">
            {fajrCongregationCount} <span className="text-xs font-normal text-amber-600">/ 7</span>
          </div>
          <div className="text-[11px] font-medium text-amber-900 mt-0.5">
            فجر جماعة
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-blue-50/50 rounded-2xl p-3 border border-cyan-100 flex flex-col items-center text-center">
          <div className="text-cyan-700 font-extrabold text-lg sm:text-xl">
            {totalQuranPages} <span className="text-xs font-normal text-cyan-600">صفحة</span>
          </div>
          <div className="text-[11px] font-medium text-cyan-900 mt-0.5">
            ورد القرآن
          </div>
        </div>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="relative z-10 mb-2">
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-40 pt-4 pb-2 px-1">
          {dayData.map((item, index) => {
            const isHigh = item.percent >= 75;
            const isMedium = item.percent >= 50 && item.percent < 75;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onClick={() => setSelectedDay(item.log)}
              >
                {/* Tooltip on hover */}
                <div className="text-[10px] font-bold text-gray-500 mb-1 opacity-80 group-hover:opacity-100 group-hover:text-emerald-700 transition-opacity">
                  {item.percent}%
                </div>

                {/* Vertical Bar Container */}
                <div className="w-full max-w-[28px] bg-gray-100 rounded-full h-28 relative overflow-hidden flex items-end">
                  <div
                    style={{ height: `${Math.max(item.percent, 8)}%` }}
                    className={`w-full rounded-full transition-all duration-500 group-hover:brightness-110 ${
                      item.isToday
                        ? "bg-gradient-to-t from-emerald-600 via-teal-500 to-amber-400 shadow-sm shadow-emerald-500/30"
                        : isHigh
                        ? "bg-gradient-to-t from-emerald-600 to-teal-500"
                        : isMedium
                        ? "bg-gradient-to-t from-amber-500 to-yellow-400"
                        : "bg-gradient-to-t from-rose-500 to-orange-400"
                    }`}
                  />
                </div>

                {/* Day Label */}
                <div className="mt-2 text-center">
                  <span
                    className={`text-[11px] block font-semibold transition-colors ${
                      item.isToday
                        ? "text-emerald-700 font-bold underline decoration-2 decoration-emerald-500"
                        : "text-gray-500 group-hover:text-gray-800"
                    }`}
                  >
                    {item.dayName}
                  </span>
                  {item.isToday && (
                    <span className="text-[9px] text-emerald-600 font-bold block">اليوم</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Quick Inspector */}
      {selectedDay && (
        <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              سجل يوم <span className="font-bold">{formatDay(selectedDay.date, { weekday: "long", day: "numeric", month: "short" })}</span>: الفجر ({PRAYER_STATUS_LABELS[selectedDay.fajr]})، القرآن ({selectedDay.quranPages} ص)، {FASTING_LABELS[selectedDay.fasting]}.
            </span>
          </div>
          <button
            onClick={() => setSelectedDay(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-[11px] px-2 py-0.5 rounded-lg hover:bg-emerald-100"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Motivational Insight Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {avgCompletion >= 80
              ? "مستوى استثنائي! استمر على هذا الثبات المبارك ونيل رضوان الله."
              : avgCompletion >= 60
              ? "أداء طيب ومبشر، شد الهمة في صلوات الجماعة لرفع معدلك."
              : "لا تيأس؛ فخير الأعمال أدومها وإن قل، وابدأ يومك بصدق النية."}
          </span>
        </div>
      </div>
    </div>
  );
}
