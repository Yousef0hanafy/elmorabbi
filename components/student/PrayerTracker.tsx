"use client";

import { useState, useTransition } from "react";
import { updatePrayerAction } from "@/lib/actions/log-actions";
import type { DailyLogRecord } from "@/lib/data-service";
import type { PrayerKey, PrayerStatus } from "@/lib/validation";
import { PRAYER_STATUS_LABELS } from "@/lib/labels";
import { celebrate } from "@/lib/celebrate";
import { Card, CardHeader } from "@/components/ui/Card";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { CheckCircle2, Clock, Users, XCircle, Sparkles } from "lucide-react";

interface PrayerTrackerProps {
  initialLog: DailyLogRecord;
}

const prayers: { key: PrayerKey; name: string; subtitle: string }[] = [
  { key: "fajr", name: "الفجر", subtitle: "من صلى الفجر في جماعة فكأنما قام الليل كله" },
  { key: "dhuhr", name: "الظهر", subtitle: "أول صلاة صلاها جبريل عليه السلام بالنبي ﷺ" },
  { key: "asr", name: "العصر", subtitle: "الصلاة الوسطى - من فاتته فكأنما وتر أهله وماله" },
  { key: "maghrib", name: "المغرب", subtitle: "لا تزال أمتي بخير ما لم يؤخروا المغرب" },
  { key: "isha", name: "العشاء", subtitle: "من صلى العشاء في جماعة فكأنما قام نصف الليل" },
];

type RecordedStatus = Exclude<PrayerStatus, "pending">;

const statusOptions: { value: RecordedStatus; label: string; hint: string; icon: typeof Users; active: string }[] = [
  {
    value: "congregation",
    label: "جماعة",
    hint: "صليتها في جماعة",
    icon: Users,
    active: "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25",
  },
  {
    value: "ontime",
    label: "في وقتها",
    hint: "صليتها منفرداً في وقتها",
    icon: CheckCircle2,
    active: "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/25",
  },
  {
    value: "late",
    label: "قضاء",
    hint: "صليتها بعد خروج وقتها",
    icon: Clock,
    active: "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/25",
  },
  {
    value: "missed",
    label: "فاتتني",
    hint: "لم أصلِّها",
    icon: XCircle,
    active: "bg-slate-700 text-white border-slate-700",
  },
];

const isPrayedOnTime = (status: PrayerStatus) => status === "congregation" || status === "ontime";

export function PrayerTracker({ initialLog }: PrayerTrackerProps) {
  const [log, setLog] = useState(initialLog);
  const [, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleStatusChange = (prayerKey: PrayerKey, chosen: RecordedStatus) => {
    // Tapping the selected status again clears it back to "not logged yet"
    const newStatus: PrayerStatus = log[prayerKey] === chosen ? "pending" : chosen;

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

      const allOnTime = prayers.every((p) => isPrayedOnTime(updated[p.key]));
      const wasAllOnTime = prayers.every((p) => isPrayedOnTime(previous[p.key]));
      if (allOnTime && !wasAllOnTime) {
        celebrate("large");
      }
    });
  };

  const loggedCount = prayers.filter((p) => log[p.key] !== "pending").length;

  return (
    <Card>
      <CardHeader
        icon={Sparkles}
        title="الصلوات الخمس"
        subtitle="اضغط على حالة كل صلاة بعد أدائها، واضغط عليها مرة أخرى للتراجع"
        action={
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {loggedCount} / 5 مسجّلة
          </span>
        }
      />

      <div className="space-y-3">
        {prayers.map((prayer) => {
          const currentStatus = log[prayer.key];

          return (
            <div
              key={prayer.key}
              role="group"
              aria-label={`صلاة ${prayer.name}`}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/70"
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 text-base">صلاة {prayer.name}</span>
                  <span className="hidden sm:block text-[11px] text-slate-500 font-quran truncate">
                    {prayer.subtitle}
                  </span>
                </div>
                {currentStatus === "pending" && (
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                    {PRAYER_STATUS_LABELS.pending}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {statusOptions.map((opt) => {
                  const isSelected = currentStatus === opt.value;
                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={isSelected}
                      title={opt.hint}
                      onClick={() => handleStatusChange(prayer.key, opt.value)}
                      className={`min-h-12 flex flex-col items-center justify-center gap-0.5 px-1 rounded-xl text-xs font-bold border transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600 ${
                        isSelected
                          ? opt.active
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span className="whitespace-nowrap">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-slate-500">
        <strong className="text-amber-700">قضاء</strong> = صليتها بعد خروج وقتها.
      </p>
      <ErrorAlert message={saveError} className="mt-3" />
    </Card>
  );
}
