"use client";

import { useState } from "react";
import { MessageCircleQuestion, Reply, Clock, ChevronDown } from "lucide-react";
import { SendFeedbackDialog } from "./SendFeedbackDialog";

interface InquiryItem {
  id: string;
  studentId: string;
  studentName: string;
  content: string;
  category?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface SheikhQuestionsFeedProps {
  inquiries: InquiryItem[];
}

export function SheikhQuestionsFeed({ inquiries }: SheikhQuestionsFeedProps) {
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const INITIAL_LIMIT = 3;
  const visibleInquiries = isExpanded ? inquiries : inquiries.slice(0, INITIAL_LIMIT);
  const remainingCount = inquiries.length - INITIAL_LIMIT;

  if (inquiries.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center">
        <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2.5">
          <MessageCircleQuestion className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">لا توجد استفسارات واردة من الطلاب بعد</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          عندما يرسل أحد طلاب الحلقة سؤالاً أو طلب نصيحة من لوحته، سيظهر هنا مباشرة لتتمكن من إجابته.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <MessageCircleQuestion className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">استفسارات وأسئلة الطلاب الواردة</h3>
            <p className="text-xs text-slate-500">طلبات التوجيه والفتاوى التربوية الخاصة بطلاب حلقتك</p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900">
          {inquiries.length} استفسار
        </span>
      </div>

      {/* Inquiries Cards */}
      <div className="space-y-3">
        {visibleInquiries.map((inq) => (
          <div
            key={inq.id}
            className="p-4 rounded-2xl border border-amber-200/60 bg-amber-50/30 hover:bg-amber-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-200/80 text-amber-900 font-bold text-xs flex items-center justify-center">
                  {inq.studentName[0]}
                </span>
                <span className="font-bold text-xs text-slate-900">{inq.studentName}</span>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {inq.createdAt}
                </span>
                {inq.category && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {inq.category}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-white/90 p-3 rounded-xl border border-slate-100 font-quran">
                {inq.content}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStudent({ id: inq.studentId, name: inq.studentName })}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors self-end sm:self-center shrink-0"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>الرد على الطالب</span>
            </button>
          </div>
        ))}
      </div>

      {/* Expand / Collapse Load More Button */}
      {inquiries.length > INITIAL_LIMIT && (
        <div className="pt-3 text-center border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all shadow-2xs"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
            <span>
              {isExpanded
                ? "عرض أحدث 3 استفسارات فقط (طي القائمة)"
                : `عرض باقي الاستفسارات (+${remainingCount} متبقي)`}
            </span>
          </button>
        </div>
      )}

      {/* Feedback Dialog */}
      {selectedStudent && (
        <SendFeedbackDialog
          isOpen={true}
          onClose={() => setSelectedStudent(null)}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
        />
      )}
    </div>
  );
}
