"use client";

import { useState } from "react";
import { FeedbackRecord } from "@/lib/data-service";
import { ChevronDown, ChevronUp, MessageSquareQuote } from "lucide-react";

interface StudentFeedbackHistoryProps {
  feedbacks: FeedbackRecord[];
}

export function StudentFeedbackHistory({ feedbacks }: StudentFeedbackHistoryProps) {
  const INITIAL_LIMIT = 3;
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const visibleFeedbacks = feedbacks.slice(0, limit);

  if (feedbacks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
        <MessageSquareQuote className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500">لا توجد توجيهات سابقة مرسلة لهذا الطالب بعد.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">
          سجل التوجيهات السابقة ({feedbacks.length})
        </h2>
        {feedbacks.length > INITIAL_LIMIT && (
          <span className="text-[11px] text-slate-500 font-medium">
            عرض {Math.min(limit, feedbacks.length)} من {feedbacks.length}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {visibleFeedbacks.map((fb) => (
          <div
            key={fb.id}
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800">{fb.sheikhName}</span>
              <span className="text-[11px] text-slate-400">{fb.createdAt}</span>
            </div>
            <p className="text-slate-700 font-quran leading-relaxed">
              «{fb.content}»
            </p>
          </div>
        ))}
      </div>

      {feedbacks.length > limit ? (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setLimit((prev) => prev + 5)}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>عرض المزيد من التوجيهات (+{feedbacks.length - limit} متبقي)</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      ) : feedbacks.length > INITIAL_LIMIT ? (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setLimit(INITIAL_LIMIT)}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <span>طي القائمة وعرض أحدث {INITIAL_LIMIT} فقط</span>
            <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
