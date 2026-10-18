"use client";

import { useState, useTransition } from "react";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Dialog } from "@/components/ui/Dialog";
import { Send, X, MessageCircleQuestion, Sparkles, CheckCircle2 } from "lucide-react";
import { sendStudentQuestionAction } from "@/lib/actions/log-actions";
import { celebrate } from "@/lib/celebrate";

interface AskSheikhModalProps {
  sheikhName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AskSheikhModal({
  sheikhName = "الشيخ المشرف",
  isOpen,
  onClose,
}: AskSheikhModalProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("نصيحة تربوية");
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const categories = [
    "نصيحة تربوية",
    "سؤال في الفقه والصلاة",
    "تثبيت ورد القرآن",
    "علاج فتور الهمة",
    "أمر خاص",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    setErrorMessage(null);
    startTransition(async () => {
      const res = await sendStudentQuestionAction(content.trim(), category);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.success) {
        setIsSent(true);
        celebrate();
        setTimeout(() => {
          setIsSent(false);
          setContent("");
          onClose();
        }, 1800);
      }
    });
  };

  return (
    <Dialog onClose={onClose} label="سؤال أو استشارة للشيخ" className="rounded-3xl max-w-lg p-6 relative overflow-hidden">
      {/* Close Button */}
      <button
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute top-4 left-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {isSent ? (
        <div className="py-8 text-center flex flex-col items-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-1">تم إرسال رسالتك للشيخ</h4>
          <p className="text-xs text-gray-500 max-w-xs">
            سيطلع فضيلة الشيخ {sheikhName} على سؤالك وسيجيبك في أقرب وقت بإذن الله.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <MessageCircleQuestion className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                سؤال أو استشارة لـ {sheikhName}
              </h3>
              <p className="text-xs text-gray-500">
                اطرح استفسارك أو طلب التوجيه ليصل إلى شيخك مباشرة
              </p>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              تصنيف السؤال
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    category === cat
                      ? "bg-emerald-700 text-white shadow-xs font-bold"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              نص الرسالة أو الاستفسار
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              placeholder="اكتب ما يعرض لك من تساؤل أو رغبة في استشارة الشيخ في عبادتك أو حفظك..."
              className="w-full text-xs p-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
            />
          </div>

          <ErrorAlert message={errorMessage} />

          {/* Hint */}
          <div className="bg-emerald-50/70 rounded-2xl p-3 text-[11px] text-emerald-900 flex items-center gap-2 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>رسائلك سرية تماماً بينك وبين الشيخ المربي لمساعدتك وتثبيتك.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 rotate-180" />
              <span>{isPending ? "جارٍ الإرسال..." : "إرسال للشيخ"}</span>
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
