"use client";

import { useState, useTransition } from "react";
import { Moon, Sparkles, CheckCircle2, ShieldCheck, Flame } from "lucide-react";
import { updateFastingAction } from "@/lib/actions/log-actions";
import confetti from "canvas-confetti";

interface FastingTrackerProps {
  initialFasting: "none" | "voluntary" | "fard";
}

export function FastingTracker({ initialFasting }: FastingTrackerProps) {
  const [fasting, setFasting] = useState<"none" | "voluntary" | "fard">(initialFasting || "none");
  const [isPending, startTransition] = useTransition();

  // Check if today is Monday (1) or Thursday (4)
  const todayDay = new Date().getDay();
  const isSunnahDay = todayDay === 1 || todayDay === 4;

  const handleSelect = (status: "none" | "voluntary" | "fard") => {
    if (status === fasting) return;
    setFasting(status);

    if (status === "voluntary" || status === "fard") {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.75 },
          colors: ["#10b981", "#047857", "#fbbf24"],
        });
      } catch (e) {
        // ignore
      }
    }

    startTransition(async () => {
      await updateFastingAction(status);
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Subtle Background Ornament */}
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-gradient-to-br from-emerald-100/40 to-teal-50/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              صيام اليوم
              {fasting !== "none" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  مُسجّل
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500">سجل حالتك اليومية في الصيام لنيل الأجر والمثوبة</p>
          </div>
        </div>

        {isSunnahDay && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>يوم سنّة مستحبة</span>
          </div>
        )}
      </div>

      {/* Sunnah Banner for Mobile */}
      {isSunnahDay && (
        <div className="sm:hidden mb-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>اليوم من أيام السُّنّة المستحبة للصيام</span>
        </div>
      )}

      {/* Selection Buttons */}
      <div className="grid grid-cols-3 gap-2.5 mb-4 relative z-10">
        <button
          type="button"
          onClick={() => handleSelect("voluntary")}
          disabled={isPending}
          className={`relative flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl text-center font-bold text-xs transition-all duration-200 border ${
            fasting === "voluntary"
              ? "bg-gradient-to-b from-emerald-600 to-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/25 scale-[1.02]"
              : "bg-gray-50/80 hover:bg-emerald-50/60 text-gray-700 border-gray-200/80 hover:border-emerald-300"
          }`}
        >
          <Sparkles
            className={`w-4 h-4 mb-1.5 ${
              fasting === "voluntary" ? "text-amber-300" : "text-emerald-600"
            }`}
          />
          <span>صائم تطوعاً</span>
          <span
            className={`text-[10px] mt-0.5 font-medium ${
              fasting === "voluntary" ? "text-emerald-100" : "text-gray-400"
            }`}
          >
            نافلة وسُنّة
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("fard")}
          disabled={isPending}
          className={`relative flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl text-center font-bold text-xs transition-all duration-200 border ${
            fasting === "fard"
              ? "bg-gradient-to-b from-teal-700 to-teal-800 text-white border-teal-800 shadow-md shadow-teal-800/25 scale-[1.02]"
              : "bg-gray-50/80 hover:bg-teal-50/60 text-gray-700 border-gray-200/80 hover:border-teal-300"
          }`}
        >
          <ShieldCheck
            className={`w-4 h-4 mb-1.5 ${
              fasting === "fard" ? "text-teal-200" : "text-teal-600"
            }`}
          />
          <span>صائم فرضاً</span>
          <span
            className={`text-[10px] mt-0.5 font-medium ${
              fasting === "fard" ? "text-teal-100" : "text-gray-400"
            }`}
          >
            قضاء / نذر
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("none")}
          disabled={isPending}
          className={`relative flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl text-center font-bold text-xs transition-all duration-200 border ${
            fasting === "none"
              ? "bg-gray-800 text-white border-gray-800 shadow-sm"
              : "bg-gray-50/80 hover:bg-gray-100 text-gray-600 border-gray-200/80"
          }`}
        >
          <span className="text-base mb-1">🍽️</span>
          <span>مُفطر اليوم</span>
          <span
            className={`text-[10px] mt-0.5 font-medium ${
              fasting === "none" ? "text-gray-300" : "text-gray-400"
            }`}
          >
            يوم اعتيادي
          </span>
        </button>
      </div>

      {/* Spiritual Footnote */}
      <div className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100/80 flex items-center gap-2.5 text-xs text-emerald-900">
        <Flame className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="leading-relaxed">
          قال ﷺ: <span className="font-semibold">«مَن صام يومًا في سبيل الله، باعَدَ الله وجهه عن النار سبعين خريفًا»</span>
        </p>
      </div>
    </div>
  );
}
