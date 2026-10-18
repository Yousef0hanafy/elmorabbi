import { Card, CardHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Medal, Flame } from "lucide-react";

interface HalaqahRankProps {
  // null when the student has not joined a halaqah yet
  rank: number | null;
  total: number;
  streakDays: number;
  halaqahName?: string;
}

// Shows the student's own standing only; other students' names and records are never sent
export function HalaqahRank({ rank, total, streakDays, halaqahName }: HalaqahRankProps) {
  return (
    <Card>
      <CardHeader
        icon={Medal}
        iconClassName="bg-amber-100 text-amber-800"
        title="ترتيبك في الحلقة"
        subtitle={halaqahName ? `بين طلاب ${halaqahName}` : "انضم لحلقة شيخ لتعرف ترتيبك"}
      />

      {rank === null ? (
        <div className="text-center space-y-3 py-2">
          <p className="text-sm text-slate-600">لم تنضم لأي حلقة بعد.</p>
          <ButtonLink href="/student/choose-sheikh" variant="accent" size="sm">
            اختيار الشيخ المربي
          </ButtonLink>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/70">
          <div>
            <span className="text-3xl font-extrabold text-amber-900">{rank}</span>
            <span className="text-sm font-semibold text-amber-800"> من {total}</span>
            <p className="text-xs text-amber-800/80 mt-1">
              {rank === 1 ? "أنت في المقدمة، ثبتك الله" : "يُحسب الترتيب بسلسلة الاستقامة ثم إنجاز اليوم"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-amber-800 bg-white px-3 py-2 rounded-xl border border-amber-200">
            <Flame className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span>{streakDays} يوماً</span>
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] text-slate-400 font-quran">﴿وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ﴾</p>
    </Card>
  );
}
