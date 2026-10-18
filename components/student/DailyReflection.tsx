"use client";

import { useState, useTransition } from "react";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { updateNotesAction } from "@/lib/actions/log-actions";
import { MessageSquare, Send, Check } from "lucide-react";

interface DailyReflectionProps {
  initialNotes?: string;
}

export function DailyReflection({ initialNotes = "" }: DailyReflectionProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = () => {
    setSaveError(null);
    startTransition(async () => {
      const res = await updateNotesAction(notes);
      if (res.error) {
        setSaveError(res.error);
        return;
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            المحاسبة اليومية وسؤال الشيخ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            اكتب ما استشكل عليك أو عائقاً واجهته ليطلع عليه الشيخ ويوجهك
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="اكتب هنا خواطرك لليوم، ما تشعر بالتقصير فيه، أو استفسارك التربوي للشيخ..."
          className="w-full text-sm rounded-xl border border-slate-200 p-3 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none bg-slate-50/50"
        />

        <div className="flex justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isSaved
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم الحفظ لملفك</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{isPending ? "جاري الحفظ..." : "حفظ الملاحظة للشيخ"}</span>
              </>
            )}
          </button>
        </div>
      </div>
      <ErrorAlert message={saveError} className="mt-3" />
    </div>
  );
}
