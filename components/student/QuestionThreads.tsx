import { Card, CardHeader } from "@/components/ui/Card";
import { MessagesSquare, CornerDownLeft } from "lucide-react";

interface Thread {
  id: string;
  content: string;
  category?: string;
  createdAt: string;
  replies: { id: string; content: string; isRead: boolean; createdAt: string }[];
}

interface QuestionThreadsProps {
  threads: Thread[];
  sheikhName?: string;
}

// The student's own questions, each followed by the sheikh's replies
export function QuestionThreads({ threads, sheikhName = "الشيخ" }: QuestionThreadsProps) {
  if (threads.length === 0) return null;

  return (
    <Card>
      <CardHeader
        icon={MessagesSquare}
        iconClassName="bg-teal-100 text-teal-800"
        title="أسئلتي وردود الشيخ"
        subtitle="أسئلتك خاصة بينك وبين شيخك"
      />
      <ul className="space-y-4">
        {threads.map((t) => (
          <li key={t.id} className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-3.5 bg-slate-50">
              <div className="flex items-center justify-between gap-2 mb-1 text-[11px]">
                <span className="font-bold text-slate-600">سؤالك{t.category ? ` • ${t.category}` : ""}</span>
                <span className="text-slate-400">{t.createdAt}</span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed">{t.content}</p>
            </div>

            {t.replies.length === 0 ? (
              <p className="px-3.5 py-2.5 text-xs text-slate-500 border-t border-slate-100">
                بانتظار رد {sheikhName}…
              </p>
            ) : (
              t.replies.map((r) => (
                <div key={r.id} className="p-3.5 border-t border-emerald-100 bg-emerald-50/50">
                  <div className="flex items-center justify-between gap-2 mb-1 text-[11px]">
                    <span className="font-bold text-emerald-800 inline-flex items-center gap-1">
                      <CornerDownLeft className="w-3 h-3" aria-hidden="true" />
                      رد {sheikhName}
                      {!r.isRead && (
                        <span className="ms-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">جديد</span>
                      )}
                    </span>
                    <span className="text-slate-400">{r.createdAt}</span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-quran">{r.content}</p>
                </div>
              ))
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
