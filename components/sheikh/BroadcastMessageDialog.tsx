"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { X, Send, Megaphone, Sparkles, HeartHandshake, AlertCircle, MessageSquareQuote } from "lucide-react";
import { broadcastSheikhMessageAction } from "@/lib/actions/sheikh-actions";
import { celebrate } from "@/lib/celebrate";

interface BroadcastMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalStudents: number;
}

export function BroadcastMessageDialog({
  isOpen,
  onClose,
  totalStudents,
}: BroadcastMessageDialogProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"praise" | "advice" | "warning" | "general">("advice");
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    setErrorMessage(null);
    startTransition(async () => {
      const res = await broadcastSheikhMessageAction(content, type);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
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

  const types = [
    { key: "advice" as const, label: "نصيحة وتوجيه", icon: HeartHandshake, color: "text-amber-700 bg-amber-50 border-amber-200" },
    { key: "praise" as const, label: "ثناء وتشجيع", icon: Sparkles, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { key: "warning" as const, label: "تذكير وتنبيه", icon: AlertCircle, color: "text-rose-700 bg-rose-50 border-rose-200" },
    { key: "general" as const, label: "إعلان عام", icon: MessageSquareQuote, color: "text-slate-700 bg-slate-50 border-slate-200" },
  ];

  return (
    <Dialog onClose={onClose} label="إرسال توجيه عام لطلاب الحلقة" className="rounded-3xl max-w-lg p-6 relative overflow-hidden">
      <button
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute top-4 left-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {isSent ? (
        <div className="py-8 text-center flex flex-col items-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <Megaphone className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-1">تم إرسال التوجيه بنجاح</h4>
          <p className="text-xs text-slate-500 max-w-xs">
            وصلت رسالتك لكافة طلاب الحلقة ({totalStudents} طالب) في لوحات متابعتهم الشخصية.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                إرسال توجيه عام لجميع طلاب الحلقة
              </h3>
              <p className="text-xs text-slate-500">
                سيصل هذا التوجيه لجميع الطلاب المنضمين لحلقتك ({totalStudents} طلاب)
              </p>
            </div>
          </div>

          <ErrorAlert message={errorMessage} />

          {/* Type selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              نوع التوجيه
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {types.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setType(t.key)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : `${t.color} hover:brightness-95`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              نص التوجيه أو الموعظة
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              placeholder="اكتب توجيهك أو نصيحتك التربوية لطلاب الحلقة هنا..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 resize-none font-quran"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 rotate-180" />
              <span>{isPending ? "جارٍ الإرسال..." : "إرسال للجميع"}</span>
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
