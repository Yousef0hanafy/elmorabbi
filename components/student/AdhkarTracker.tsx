"use client";

import { useState, useTransition } from "react";
import { updateAdhkarAction } from "@/lib/actions/log-actions";
import { Sun, Moon, Check, ShieldCheck, BookOpen } from "lucide-react";
import { AdhkarModal } from "./AdhkarModal";

interface AdhkarTrackerProps {
  initialMorning: boolean;
  initialEvening: boolean;
}

export function AdhkarTracker({ initialMorning, initialEvening }: AdhkarTrackerProps) {
  const [morning, setMorning] = useState(initialMorning);
  const [evening, setEvening] = useState(initialEvening);
  const [isPending, startTransition] = useTransition();

  const [activeModal, setActiveModal] = useState<"morning" | "evening" | null>(null);

  const handleToggleMorning = () => {
    const next = !morning;
    setMorning(next);
    startTransition(async () => {
      await updateAdhkarAction("morning", next);
    });
  };

  const handleToggleEvening = () => {
    const next = !evening;
    setEvening(next);
    startTransition(async () => {
      await updateAdhkarAction("evening", next);
    });
  };

  const handleCompleteMorningFromModal = () => {
    setMorning(true);
    startTransition(async () => {
      await updateAdhkarAction("morning", true);
    });
  };

  const handleCompleteEveningFromModal = () => {
    setEvening(true);
    startTransition(async () => {
      await updateAdhkarAction("evening", true);
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              حصن المسلم (أذكار الصباح والمساء)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              حرز المؤمن وحصنه المنيع من كل شر ووسوسة
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Morning Adhkar */}
          <div
            className={`border rounded-xl p-4 transition-all flex flex-col justify-between gap-3 ${
              morning
                ? "bg-amber-50/70 border-amber-300/80 shadow-xs"
                : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    morning ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    أذكار الصباح
                  </span>
                  <span className="text-[11px] text-slate-500 font-quran">
                    «أصبحنا وأصبح الملك لله...»
                  </span>
                </div>
              </div>

              {/* Quick toggle checkmark */}
              <button
                type="button"
                onClick={handleToggleMorning}
                title="تحديد الإنجاز السريع"
                className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                  morning
                    ? "bg-amber-600 border-amber-600 text-white"
                    : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                {morning && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            </div>

            {/* Read Azkar button */}
            <div className="pt-1 flex items-center justify-between border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveModal("morning")}
                className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-amber-100/60 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>قراءة الأذكار والتسبيح</span>
              </button>
              {morning && (
                <span className="text-[11px] font-bold text-emerald-700">
                  تم الإنجاز ✓
                </span>
              )}
            </div>
          </div>

          {/* Evening Adhkar */}
          <div
            className={`border rounded-xl p-4 transition-all flex flex-col justify-between gap-3 ${
              evening
                ? "bg-indigo-50/70 border-indigo-300/80 shadow-xs"
                : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    evening ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    أذكار المساء
                  </span>
                  <span className="text-[11px] text-slate-500 font-quran">
                    «أمسينا وأمسى الملك لله...»
                  </span>
                </div>
              </div>

              {/* Quick toggle checkmark */}
              <button
                type="button"
                onClick={handleToggleEvening}
                title="تحديد الإنجاز السريع"
                className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                  evening
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                {evening && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            </div>

            {/* Read Azkar button */}
            <div className="pt-1 flex items-center justify-between border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveModal("evening")}
                className="text-xs text-indigo-800 hover:text-indigo-900 font-bold flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-indigo-100/60 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>قراءة الأذكار والتسبيح</span>
              </button>
              {evening && (
                <span className="text-[11px] font-bold text-emerald-700">
                  تم الإنجاز ✓
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Adhkar interactive reading modal */}
      {activeModal && (
        <AdhkarModal
          type={activeModal}
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onComplete={
            activeModal === "morning"
              ? handleCompleteMorningFromModal
              : handleCompleteEveningFromModal
          }
        />
      )}
    </>
  );
}
