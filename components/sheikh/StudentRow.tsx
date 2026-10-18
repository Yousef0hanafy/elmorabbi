"use client";

import { useState } from "react";
import Link from "next/link";
import type { DailyLogRecord } from "@/lib/data-service";
import { FASTING_LABELS, PRAYERS, PRAYER_STATUS_BADGE, PRAYER_STATUS_LABELS, STUDENT_ALERT_LABELS } from "@/lib/labels";
import { hasLoggedAnything, needsFollowUp, type StudentAlert } from "@/lib/scoring";
import { SendFeedbackDialog } from "./SendFeedbackDialog";
import { Flame, AlertTriangle, MessageSquareQuote, ChevronLeft, BookOpen } from "lucide-react";

export interface StudentRowData {
  id: string;
  name: string;
  profile: { streakDays: number; level: string };
  todayLog?: DailyLogRecord;
  completionRate: number;
  alerts: StudentAlert[];
}

// Reasons shown in the follow-up line, today's issues first
function followUpReasons(student: StudentRowData): string[] {
  const reasons: string[] = [];
  const log = student.todayLog;
  if (log) {
    const missed = PRAYERS.filter((p) => log[p.key] === "missed").map((p) => p.name);
    if (missed.length > 0) reasons.push(`فاتته اليوم: ${missed.join("، ")}`);
    if (log.fajr === "late") reasons.push("صلى الفجر قضاءً اليوم");
  }
  return [...reasons, ...student.alerts.map((a) => STUDENT_ALERT_LABELS[a])];
}

export function StudentRow({ student }: { student: StudentRowData }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const log = student.todayLog;
  const reasons = followUpReasons(student);
  const flagged = reasons.length > 0 || needsFollowUp(log);
  const logged = hasLoggedAnything(log);

  return (
    <li
      className={`bg-white rounded-2xl border p-4 shadow-xs ${flagged ? "border-rose-200" : "border-slate-200"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
            {student.name[0]}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-sm truncate">{student.name}</h3>
            <span className="text-[11px] text-slate-500">{student.profile.level}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs font-bold">
          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
            <Flame className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            {student.profile.streakDays}
            <span className="sr-only">يوماً متتالية</span>
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg" title="إنجاز اليوم">
            {student.completionRate}%
          </span>
        </div>
      </div>

      {/* Today's prayers as compact chips */}
      <ul className="mt-3 grid grid-cols-5 gap-1.5" aria-label="صلوات اليوم">
        {PRAYERS.map((p) => {
          const status = log ? log[p.key] : "pending";
          return (
            <li
              key={p.key}
              className={`rounded-lg px-1 py-1.5 text-center text-[11px] font-bold ${PRAYER_STATUS_BADGE[status]}`}
            >
              <span className="block">{p.name}</span>
              <span className="block text-[10px] font-semibold opacity-80">{PRAYER_STATUS_LABELS[status]}</span>
            </li>
          );
        })}
      </ul>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${log?.quranRead ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"}`}>
          <BookOpen className="w-3 h-3" aria-hidden="true" />
          {log?.quranRead ? `${log.quranPages} ص` : "لم يقرأ"}
        </span>
        <span className={`px-2 py-0.5 rounded-full ${log?.adhkarMorning ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-500"}`}>
          أذكار الصباح
        </span>
        <span className={`px-2 py-0.5 rounded-full ${log?.adhkarEvening ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-500"}`}>
          أذكار المساء
        </span>
        {log && log.fasting !== "none" && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{FASTING_LABELS[log.fasting]}</span>
        )}
      </div>

      {reasons.length > 0 ? (
        <p className="mt-2.5 text-xs font-semibold text-rose-700 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{reasons.join(" • ")}</span>
        </p>
      ) : (
        !logged && <p className="mt-2.5 text-xs text-slate-500">لم يسجّل ورده اليوم بعد</p>
      )}

      {log?.notes && (
        <p className="mt-2 text-xs text-amber-900 bg-amber-50/70 border border-amber-100 rounded-lg px-2.5 py-1.5 line-clamp-2 font-quran">
          «{log.notes}»
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className="min-h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <MessageSquareQuote className="w-4 h-4" aria-hidden="true" />
          توجيه
        </button>
        <Link
          href={`/sheikh/students/${student.id}`}
          className="min-h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1"
        >
          السجل الكامل
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {feedbackOpen && (
        <SendFeedbackDialog
          isOpen={true}
          onClose={() => setFeedbackOpen(false)}
          studentId={student.id}
          studentName={student.name}
        />
      )}
    </li>
  );
}
