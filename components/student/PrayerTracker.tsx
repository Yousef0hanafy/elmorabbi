"use client";

import { useState, useTransition } from "react";
import { updatePrayerAction } from "@/lib/actions/log-actions";
import { DailyLogRecord } from "@/lib/data-service";
import confetti from "canvas-confetti";
import { CheckCircle2, Clock, Users, XCircle, Sparkles } from "lucide-react";

interface PrayerTrackerProps {
  initialLog: DailyLogRecord;
}

type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
type PrayerStatus = "congregation" | "ontime" | "late" | "missed";

const prayers: { key: PrayerKey; name: string; subtitle: string }[] = [
  { key: "fajr", name: "صلاة الفجر", subtitle: "من صلى الفجر في جماعة فكأنما قام الليل كله" },
  { key: "dhuhr", name: "صلاة الظهر", subtitle: "أول صلاة صلاها جبريل عليه السلام بالنبي ﷺ" },
  { key: "asr", name: "صلاة العصر", subtitle: "الصلاة الوسطى - من فاتته فكأنما وتر أهله وماله" },
  { key: "maghrib", name: "صلاة المغرب", subtitle: "لا تزال أمتي بخير ما لم يؤخروا المغرب" },
  { key: "isha", name: "صلاة العشاء", subtitle: "من صلى العشاء في جماعة فكأنما قام نصف الليل" },
];

const statusOptions: { value: PrayerStatus; label: string; icon: typeof Users; color: string; bgActive: string }[] = [
  {
    value: "congregation",
    label: "في جماعة",
    icon: Users,
    color: "text-emerald-700",
    bgActive: "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border-emerald-600",
  },
  {
    value: "ontime",
    label: "في وقتها",
    icon: CheckCircle2,
    color: "text-teal-700",
    bgActive: "bg-teal-600 text-white shadow-md shadow-teal-600/30 border-teal-600",
  },
  {
    value: "late",
    label: "قضاء",
    icon: Clock,
    color: "text-amber-700",
    bgActive: "bg-amber-600 text-white shadow-md shadow-amber-600/30 border-amber-600",
  },
  {
    value: "missed",
    label: "لم أصلِّ",
    icon: XCircle,
    color: "text-slate-500",
    bgActive: "bg-slate-200 text-slate-800 border-slate-300",
  },
];

export function PrayerTracker({ initialLog }: PrayerTrackerProps) {
  const [log, setLog] = useState(initialLog);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleStatusChange = (prayerKey: PrayerKey, newStatus: PrayerStatus) => {
    // Optimistic update, rolled back if saving fails
    const previous = log;
    const updated = { ...log, [prayerKey]: newStatus };
    setLog(updated);
    setSaveError(null);

    startTransition(async () => {
      const res = await updatePrayerAction(prayerKey, newStatus);
      if (res.error) {
        setLog(previous);
        setSaveError(res.error);
        return;
      }

      // Check if all 5 prayers are completed
      const allDone = ["fajr", "dhuhr", "asr", "maghrib", "isha"].every(
        (p) => updated[p as PrayerKey] === "congregation" || updated[p as PrayerKey] === "ontime"
      );

      if (allDone) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#059669", "#d97706", "#10b981"],
        });
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              الصلوات الخمس المفروضة
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              عمود الدين - اضغط على الحالة لتسجيل صلاتك فور أدائها
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {prayers.map((prayer) => {
          const currentStatus = log[prayer.key] as PrayerStatus;

          return (
            <div
              key={prayer.key}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors gap-3"
            >
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-sm sm:text-base">
                  {prayer.name}
                </span>
                <span className="text-[11px] text-slate-500 font-quran">
                  {prayer.subtitle}
                </span>
              </div>

              {/* Status options toggle buttons */}
              <div className="grid grid-cols-4 sm:flex items-center gap-1.5 self-stretch sm:self-auto">
                {statusOptions.map((opt) => {
                  const isSelected = currentStatus === opt.value;
                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleStatusChange(prayer.key, opt.value)}
                      className={`flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? opt.bgActive
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {saveError && (
        <p role="alert" className="mt-3 text-xs font-medium text-rose-700">
          {saveError}
        </p>
      )}
    </div>
  );
}
