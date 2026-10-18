import Link from "next/link";
import type { FeedbackRecord } from "@/lib/data-service";
import { FEEDBACK_TYPE_LABELS } from "@/lib/labels";
import { Card, CardHeader } from "@/components/ui/Card";
import { MessageSquareQuote, ArrowLeft } from "lucide-react";

interface LatestGuidanceProps {
  latest?: FeedbackRecord;
  total: number;
}

// Compact preview of the newest guidance on the daily page; the full feed lives on /student/sheikh
export function LatestGuidance({ latest, total }: LatestGuidanceProps) {
  return (
    <Card>
      <CardHeader
        icon={MessageSquareQuote}
        iconClassName="bg-amber-100 text-amber-800"
        title="آخر توجيه من شيخك"
        action={
          <Link
            href="/student/sheikh"
            className="min-h-9 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            <span>{total > 0 ? `كل التوجيهات (${total})` : "التوجيهات والأسئلة"}</span>
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        }
      />
      {latest ? (
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
          <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
            <span className="font-bold text-amber-800">{FEEDBACK_TYPE_LABELS[latest.type]}</span>
            <span className="text-slate-400">{latest.createdAt}</span>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed font-quran line-clamp-3">{latest.content}</p>
        </div>
      ) : (
        <p className="text-sm text-slate-500">لا توجد توجيهات بعد. يمكنك سؤال شيخك من صفحة التوجيهات.</p>
      )}
    </Card>
  );
}
