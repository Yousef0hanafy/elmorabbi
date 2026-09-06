"use client";

import { useState, useTransition } from "react";
import { updateQuranAction } from "@/lib/actions/log-actions";
import { BookOpen, Plus, Minus, CheckCircle } from "lucide-react";

interface QuranTrackerProps {
  initialRead: boolean;
  initialPages: number;
}

export function QuranTracker({ initialRead, initialPages }: QuranTrackerProps) {
  const [read, setRead] = useState(initialRead);
  const [pages, setPages] = useState(initialPages);
  const [isPending, startTransition] = useTransition();

  const handleToggleRead = () => {
    const nextRead = !read;
    const nextPages = nextRead && pages === 0 ? 5 : pages;
    setRead(nextRead);
    setPages(nextPages);

    startTransition(async () => {
      await updateQuranAction(nextRead, nextPages);
    });
  };

  const handleAdjustPages = (delta: number) => {
    const nextPages = Math.max(0, pages + delta);
    const nextRead = nextPages > 0;
    setPages(nextPages);
    setRead(nextRead);

    startTransition(async () => {
      await updateQuranAction(nextRead, nextPages);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              ورد القرآن الكريم وتلاوته
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-quran">
              «اقرؤوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه»
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={handleToggleRead}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            read
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{read ? "تمت القراءة" : "لم يقرأ بعد"}</span>
        </button>
      </div>

      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-900 block">
            مقدار التلاوة لليوم
          </span>
          <span className="text-xs text-amber-700 font-quran">
            حدد عدد الصفحات التي قرأتها بتدبر وتأنٍ
          </span>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-amber-200 shadow-xs">
          <button
            type="button"
            disabled={isPending || pages <= 0}
            onClick={() => handleAdjustPages(-1)}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-40 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="px-3 text-center">
            <span className="text-xl font-bold text-slate-900 block leading-none">
              {pages}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">صفحات</span>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleAdjustPages(1)}
            className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleAdjustPages(5)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
          >
            +5 صفحات
          </button>
        </div>
      </div>
    </div>
  );
}
