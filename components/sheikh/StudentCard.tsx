"use client";

import { useState } from "react";
import { hasLoggedAnything, needsFollowUp } from "@/lib/scoring";
import Link from "next/link";
import type { DailyLogRecord, StudentProfileRecord } from "@/lib/data-service";
import { SendFeedbackDialog } from "./SendFeedbackDialog";
import { PRAYERS, PRAYER_STATUS_BADGE, PRAYER_STATUS_LABELS } from "@/lib/labels";
import {
  Flame,
  BookOpen,
  ShieldCheck,
  MessageSquareQuote,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Circle,
  Users,
  Moon,
} from "lucide-react";

interface StudentCardProps {
  student: {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    phone?: string;
    profile: StudentProfileRecord;
    todayLog?: DailyLogRecord;
    completedDeeds: number;
    completionRate: number;
  };
}

export function StudentCard({ student }: StudentCardProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const log = student.todayLog;

  const statusIcons = { pending: Circle, congregation: Users, ontime: CheckCircle2, late: Clock, missed: XCircle };

  const isFallingBehind = needsFollowUp(log);

  return (
    <>
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between gap-4">
        {/* Falling behind alert indicator banner */}
        {isFallingBehind && (
          <div className="bg-rose-50 border-b border-rose-200/60 -mx-5 -mt-5 px-5 py-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              يحتاج متابعة (فاتته صلاة أو قضى الفجر)
            </span>
          </div>
        )}
        {!isFallingBehind && !hasLoggedAnything(log) && (
          <div className="bg-slate-50 border-b border-slate-200/60 -mx-5 -mt-5 px-5 py-2">
            <span className="text-xs font-semibold text-slate-500">لم يسجّل ورده اليوم بعد</span>
          </div>
        )}

        {/* Student identity header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {student.name ? student.name[0] : "ط"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {student.name}
                </h3>
                <span className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full">
                  {student.profile.level}
                </span>
              </div>
              <span className="text-xs text-slate-400 block mt-0.5">
                {student.email}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/60 px-2.5 py-1 rounded-full text-xs font-extrabold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {student.profile.streakDays} يوماً
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              إنجاز اليوم: <strong className="text-slate-700">{student.completionRate}%</strong>
            </span>
          </div>
        </div>

        {/* Daily Prayers Breakdown */}
        <div>
          <span className="text-xs font-bold text-slate-600 block mb-2">
            متابعة الصلوات لليوم:
          </span>
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {PRAYERS.map((p) => {
              const status = log ? log[p.key] : "pending";
              const Icon = statusIcons[status];
              return (
                <div
                  key={p.key}
                  className={`p-1.5 rounded-xl border border-transparent text-[11px] flex flex-col items-center gap-0.5 ${PRAYER_STATUS_BADGE[status]}`}
                >
                  <span className="font-semibold">{p.name}</span>
                  <div className="flex items-center gap-0.5 text-[10px] font-bold">
                    <Icon className="w-3 h-3" />
                    <span>{PRAYER_STATUS_LABELS[status]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quran, Fasting & Adhkar row */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-slate-700 font-medium">
                {log?.quranRead ? `قرآن (${log.quranPages} ص)` : "لم يقرأ بعد"}
              </span>
            </div>

            {log?.fasting && log.fasting !== "none" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Moon className="w-3 h-3 text-emerald-600" />
                {log.fasting === "voluntary" ? "صائم تطوعاً" : "صائم فرضاً"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                log?.adhkarMorning ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              أذكار الصباح
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                log?.adhkarEvening ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-600"
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              أذكار المساء
            </span>
          </div>
        </div>

        {/* Student Note / Reflection if available */}
        {log?.notes && (
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 font-quran">
            <strong className="block text-[11px] text-amber-800 mb-0.5">ملاحظة الطالب اليومية:</strong>
            «{log.notes}»
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>إرسال توجيه ومتابعة</span>
          </button>

          <Link
            href={`/sheikh/students/${student.id || student.profile.userId}`}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>السجل الكامل</span>
          </Link>
        </div>
      </div>

      <SendFeedbackDialog
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        studentId={student.id || student.profile.userId}
        studentName={student.name || "الطالب"}
      />
    </>
  );
}
