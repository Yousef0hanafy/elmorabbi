"use client";

import { useState } from "react";
import { MessageSquareQuote, HeartHandshake, AlertTriangle, Info, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface FeedbackItem {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  sheikhName: string;
  studentName: string;
}

interface RecentActivityFeedProps {
  feedbacks: FeedbackItem[];
}

export function RecentActivityFeed({ feedbacks }: RecentActivityFeedProps) {
  const INITIAL_LIMIT = 4;
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const visibleFeedbacks = feedbacks.slice(0, limit);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "praise":
        return { label: "ثناء وتشجيع", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "advice":
        return { label: "نصيحة وتوجيه", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "warning":
        return { label: "تنبيه أخوي", color: "bg-rose-100 text-rose-800 border-rose-200" };
      default:
        return { label: "توجيه عام", color: "bg-slate-100 text-slate-800 border-slate-200" };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-emerald-700" />
            <span>سجل التوجيهات والنشاط الأخير في المنصة</span>
          </h2>
          <p className="text-xs text-slate-500 font-quran mt-0.5">
            متابعة التواصل التربوي بين المشايخ والطلاب في مختلف الحلقات
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          آخر الرسائل والتوجيهات ({feedbacks.length})
        </span>
      </div>

      {feedbacks.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-xs text-slate-500">لا توجد رسائل أو توجيهات مسجلة بعد في المنصة.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleFeedbacks.map((fb) => {
            const badge = getTypeBadge(fb.type);
            return (
              <div
                key={fb.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col gap-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900">{fb.sheikhName}</span>
                    <span className="text-slate-400">إلى</span>
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {fb.studentName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={`px-2 py-0.5 rounded-md border font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-slate-400">{fb.createdAt}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-quran leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
                  «{fb.content}»
                </p>
              </div>
            );
          })}

          {feedbacks.length > limit ? (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setLimit((prev) => prev + 4)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <ChevronDown className="w-4 h-4 text-emerald-700" />
                <span>عرض المزيد من الأنشطة (+{feedbacks.length - limit} متبقي)</span>
              </button>
              <button
                type="button"
                onClick={() => setLimit(feedbacks.length)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                عرض الكل ({feedbacks.length})
              </button>
            </div>
          ) : feedbacks.length > INITIAL_LIMIT ? (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setLimit(INITIAL_LIMIT)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 bg-white px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <span>طي القائمة وعرض أحدث {INITIAL_LIMIT} أنشطة فقط</span>
                <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

