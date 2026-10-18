"use client";

import { useState, useTransition } from "react";
import { sendFeedbackAction } from "@/lib/actions/sheikh-actions";
import { MessageSquareQuote, X, Sparkles, Send, HeartHandshake, AlertCircle } from "lucide-react";

interface SendFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

type FeedbackType = "praise" | "advice" | "warning" | "general";

const quickTemplates = [
  {
    type: "praise" as FeedbackType,
    text: "ما شاء الله تبارك الله يا بني، حرصك على صلاة الفجر في جماعة وتلاوة وردك بانتظام يثلج الصدر. ثبتك الله وبارك فيك.",
  },
  {
    type: "advice" as FeedbackType,
    text: "النوم المبكر والابتعاد عن الشاشات ليلاً هو مفتاح النشاط لصلاة الفجر وتدبر القرآن. احرص على ذلك اليوم.",
  },
  {
    type: "warning" as FeedbackType,
    text: "لاحظت انقطاعك عن تسجيل الورد اليومي، الصدق والمحاسبة هما طريق الاستقامة. تواصل معي إن كان لديك أي عائق.",
  },
];

export function SendFeedbackDialog({
  isOpen,
  onClose,
  studentId,
  studentName,
}: SendFeedbackDialogProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<FeedbackType>("advice");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setErrorMessage(null);
    startTransition(async () => {
      const res = await sendFeedbackAction(studentId, content, type);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setContent("");
          onClose();
        }, 1200);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              إرسال توجيه ومتابعة
            </h3>
            <p className="text-xs text-slate-500">
              إلى الطالب: <span className="font-semibold text-emerald-700">{studentName}</span>
            </p>
          </div>
        </div>

        {/* Feedback Type Selector */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-700 block mb-2">
            نوع التوجيه:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType("praise")}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                type === "praise"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              ثناء وتشجيع
            </button>
            <button
              type="button"
              onClick={() => setType("advice")}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                type === "advice"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              نصيحة وتوجيه
            </button>
            <button
              type="button"
              onClick={() => setType("warning")}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                type === "warning"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              تنبيه أخوي
            </button>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="mb-4">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
            نماذج توجيه سريعة (اضغط للإدراج):
          </span>
          <div className="space-y-1.5">
            {quickTemplates.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setContent(tmpl.text);
                  setType(tmpl.type);
                }}
                className="w-full text-right p-2 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 text-[11px] text-slate-600 transition-colors font-quran truncate block"
              >
                «{tmpl.text}»
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMessage}
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              نص الرسالة والتوجيه:
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب توجيهك التربوي للطالب هنا..."
              className="w-full text-sm rounded-xl border border-slate-200 p-3 text-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none bg-slate-50/50"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isPending || !content.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{success ? "تم الإرسال بنجاح!" : isPending ? "جاري الإرسال..." : "إرسال التوجيه"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
