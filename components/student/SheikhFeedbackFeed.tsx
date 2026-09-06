"use client";

import { useState } from "react";
import { FeedbackRecord } from "@/lib/data-service";
import { MessageSquareQuote, HeartHandshake, AlertCircle, Sparkles, MessageCircleQuestion, ChevronDown, ChevronUp } from "lucide-react";
import { AskSheikhModal } from "./AskSheikhModal";

interface SheikhFeedbackFeedProps {
  feedbacks: FeedbackRecord[];
  sheikhName?: string;
}

export function SheikhFeedbackFeed({ feedbacks, sheikhName }: SheikhFeedbackFeedProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const INITIAL_LIMIT = 3;
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const visibleFeedbacks = feedbacks.slice(0, limit);

  const getTypeBadge = (type: FeedbackRecord["type"]) => {
    switch (type) {
      case "praise":
        return {
          label: "ثناء وتشجيع",
          bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: Sparkles,
        };
      case "advice":
        return {
          label: "نصيحة وتوجيه",
          bg: "bg-amber-100 text-amber-800 border-amber-200",
          icon: HeartHandshake,
        };
      case "warning":
        return {
          label: "تنبيه أخوي",
          bg: "bg-rose-100 text-rose-800 border-rose-200",
          icon: AlertCircle,
        };
      default:
        return {
          label: "توجيه عام",
          bg: "bg-slate-100 text-slate-800 border-slate-200",
          icon: MessageSquareQuote,
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                توجيهات واستشارات الشيخ
              </h2>
              {feedbacks.length > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {feedbacks.length}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              رسائل خاصة وتوصيات لمتابعة ثباتك وتزكيتك
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all shadow-2xs hover:shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <MessageCircleQuestion className="w-4 h-4 text-emerald-600" />
          <span>اسأل الشيخ استشارة</span>
        </button>
      </div>

      {feedbacks.length === 0 ? (
        <div className="rounded-2xl p-6 border border-dashed border-gray-200 text-center bg-gray-50/50">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">
            لا توجد توجيهات جديدة بعد
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            سيقوم الشيخ {sheikhName || "المشرف"} بالاطلاع على التزامك اليومي بالصلوات والورد وإرسال النصائح والتوجيهات هنا.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleFeedbacks.map((fb) => {
            const badge = getTypeBadge(fb.type);
            const Icon = badge.icon;

            return (
              <div
                key={fb.id}
                className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-900">
                      {fb.sheikhName}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}
                    >
                      <Icon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {fb.createdAt}
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-100/80">
                  {fb.content}
                </p>
              </div>
            );
          })}

          {feedbacks.length > limit ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setLimit((prev) => prev + 4)}
                className="w-full py-2.5 px-4 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 border border-emerald-200/70 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>عرض التوجيهات السابقة (+{feedbacks.length - limit} متبقي)</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
              </button>
            </div>
          ) : feedbacks.length > INITIAL_LIMIT ? (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setLimit(INITIAL_LIMIT)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <span>طي وعرض أحدث {INITIAL_LIMIT} توجيهات فقط</span>
                <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Ask Sheikh Modal */}
      <AskSheikhModal
        sheikhName={sheikhName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
