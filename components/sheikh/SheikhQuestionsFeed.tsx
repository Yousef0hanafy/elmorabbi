"use client";

import { useState } from "react";
import { MessageCircleQuestion, Reply, Clock, ChevronDown, CheckCircle2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { SendFeedbackDialog } from "./SendFeedbackDialog";

interface InquiryItem {
  id: string;
  studentId: string;
  studentName: string;
  content: string;
  category?: string;
  answered: boolean;
  createdAt: string;
}

interface SheikhQuestionsFeedProps {
  // Unanswered questions come first
  inquiries: InquiryItem[];
}

const INITIAL_LIMIT = 3;

export function SheikhQuestionsFeed({ inquiries }: SheikhQuestionsFeedProps) {
  const [replyTarget, setReplyTarget] = useState<InquiryItem | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const unansweredCount = inquiries.filter((q) => !q.answered).length;
  const visibleInquiries = isExpanded ? inquiries : inquiries.slice(0, Math.max(INITIAL_LIMIT, unansweredCount));
  const hiddenCount = inquiries.length - visibleInquiries.length;

  return (
    <Card>
      <CardHeader
        icon={MessageCircleQuestion}
        iconClassName="bg-amber-100 text-amber-800"
        title="أسئلة الطلاب"
        subtitle="الأسئلة التي لم تُجب تظهر أولاً، وردّك يظهر للطالب تحت سؤاله"
        action={
          unansweredCount > 0 ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-white">
              {unansweredCount} بانتظار الرد
            </span>
          ) : undefined
        }
      />

      {inquiries.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">
          لا توجد أسئلة بعد. عندما يرسل أحد طلابك سؤالاً سيظهر هنا لتجيبه.
        </p>
      ) : (
        <ul className="space-y-3">
          {visibleInquiries.map((inq) => (
            <li
              key={inq.id}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                inq.answered ? "border-slate-200 bg-slate-50/60" : "border-amber-200 bg-amber-50/40"
              }`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{inq.studentName}</span>
                  {inq.category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {inq.category}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {inq.createdAt}
                  </span>
                  {inq.answered && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                      تم الرد
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                  {inq.content}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReplyTarget(inq)}
                className={`min-h-11 shrink-0 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  inq.answered
                    ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
              >
                <Reply className="w-4 h-4" aria-hidden="true" />
                <span>{inq.answered ? "رد إضافي" : "الرد على السؤال"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {inquiries.length > INITIAL_LIMIT && (hiddenCount > 0 || isExpanded) && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 w-full min-h-11 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-1.5"
        >
          <span>{isExpanded ? "عرض أقل" : `عرض الأسئلة المُجابة (+${hiddenCount})`}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      )}

      {replyTarget && (
        <SendFeedbackDialog
          isOpen={true}
          onClose={() => setReplyTarget(null)}
          studentId={replyTarget.studentId}
          studentName={replyTarget.studentName}
          replyTo={{ id: replyTarget.id, content: replyTarget.content }}
        />
      )}
    </Card>
  );
}
