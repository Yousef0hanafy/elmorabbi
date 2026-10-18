"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { updateQuranAction } from "@/lib/actions/log-actions";
import { MAX_QURAN_PAGES } from "@/lib/validation";
import { BookOpen, Plus, Minus, CheckCircle } from "lucide-react";

interface QuranTrackerProps {
  initialRead: boolean;
  initialPages: number;
}

// Rapid taps on the counter are batched into one save after this pause
const SAVE_DELAY_MS = 700;

export function QuranTracker({ initialRead, initialPages }: QuranTrackerProps) {
  const [read, setRead] = useState(initialRead);
  const [pages, setPages] = useState(initialPages);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Last values confirmed by the server, used to roll back on failure
  const savedRef = useRef({ read: initialRead, pages: initialPages });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const scheduleSave = (nextRead: boolean, nextPages: number) => {
    setRead(nextRead);
    setPages(nextPages);
    setSaveError(null);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setIsSaving(true);
      const res = await updateQuranAction(nextRead, nextPages);
      setIsSaving(false);
      if (res.error) {
        setRead(savedRef.current.read);
        setPages(savedRef.current.pages);
        setSaveError(res.error);
      } else {
        savedRef.current = { read: nextRead, pages: nextPages };
      }
    }, SAVE_DELAY_MS);
  };

  const handleToggleRead = () => {
    const nextRead = !read;
    const nextPages = nextRead && pages === 0 ? 5 : pages;
    scheduleSave(nextRead, nextRead ? nextPages : 0);
  };

  const handleAdjustPages = (delta: number) => {
    const nextPages = Math.min(MAX_QURAN_PAGES, Math.max(0, pages + delta));
    scheduleSave(nextPages > 0, nextPages);
  };

  return (
    <Card>
      <CardHeader
        icon={BookOpen}
        iconClassName="bg-amber-100 text-amber-800"
        title="ورد القرآن الكريم"
        subtitle={<span className="font-quran">«اقرؤوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه»</span>}
        action={
          <button
            type="button"
            aria-pressed={read}
            onClick={handleToggleRead}
            className={`min-h-9 flex items-center gap-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
              read ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            <span>{read ? "تمت القراءة" : "لم أقرأ بعد"}</span>
          </button>
        }
      />

      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-right">
          <span className="text-xs font-semibold text-amber-900 block">مقدار التلاوة اليوم</span>
          <span className="text-xs text-amber-700 font-quran">عدد الصفحات التي قرأتها بتدبر</span>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-amber-200 shadow-xs">
          <button
            type="button"
            aria-label="إنقاص صفحة"
            disabled={pages <= 0}
            onClick={() => handleAdjustPages(-1)}
            className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-40 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="px-2 min-w-14 text-center" aria-live="polite">
            <span className="text-xl font-bold text-slate-900 block leading-none">{pages}</span>
            <span className="text-[10px] text-slate-500 font-medium">
              {isSaving ? "جارٍ الحفظ..." : "صفحة"}
            </span>
          </div>

          <button
            type="button"
            aria-label="زيادة صفحة"
            onClick={() => handleAdjustPages(1)}
            className="w-11 h-11 rounded-lg bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleAdjustPages(5)}
            className="min-h-11 px-3 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
          >
            +5
          </button>
        </div>
      </div>

      <ErrorAlert message={saveError} className="mt-3" />
    </Card>
  );
}
