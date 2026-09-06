"use client";

import { useState, useTransition } from "react";
import { UserRecord } from "@/lib/data-service";
import { approveSheikhAction, rejectSheikhAction } from "@/lib/actions/admin-actions";
import {
  UserCheck,
  XCircle,
  Clock,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PendingSheikhsListProps {
  pendingSheikhs: UserRecord[];
}

export function PendingSheikhsList({ pendingSheikhs }: PendingSheikhsListProps) {
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleApprove = (sheikh: UserRecord) => {
    startTransition(async () => {
      const res = await approveSheikhAction(sheikh.id);
      if (res.success) {
        setActionMessage(`تم اعتماد الشيخ ${sheikh.name} بنجاح! حسابه الآن نشط وحلقته متاحة للطلاب.`);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.5 },
            colors: ["#10b981", "#fbbf24", "#047857"],
          });
        } catch (e) {
          // ignore
        }
        setTimeout(() => setActionMessage(null), 4000);
      }
    });
  };

  const handleReject = (sheikh: UserRecord) => {
    if (!confirm(`هل أنت متأكد من رفض طلب انضمام الشيخ ${sheikh.name}؟`)) return;

    startTransition(async () => {
      const res = await rejectSheikhAction(sheikh.id);
      if (res.success) {
        setActionMessage(`تم رفض طلب انضمام الشيخ ${sheikh.name}.`);
        setTimeout(() => setActionMessage(null), 4000);
      }
    });
  };

  if (pendingSheikhs.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              طلبات انضمام المشايخ والمعلمين
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              لا توجد طلبات معلقة حالياً • جميع حسابات المشايخ معتمدة ومفعلة.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          0 طلبات معلقة
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-md relative overflow-hidden transition-all">
      {/* Background Accent */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                طلبات انضمام المشايخ الجدد
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs animate-pulse">
                {pendingSheikhs.length} بانتظار الاعتماد
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              مراجعة واعتماد المشايخ المتقدمين لإنشاء حلقات تربوية جديدة
            </p>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-semibold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Pending Requests Cards */}
      <div className="space-y-3.5 relative z-10">
        {pendingSheikhs.map((sheikh) => (
          <div
            key={sheikh.id}
            className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 hover:border-amber-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            {/* Sheikh Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-200/80 text-amber-900 font-black text-base flex items-center justify-center shrink-0 border border-amber-300">
                  {sheikh.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{sheikh.name}</h3>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                      طلب جديد
                    </span>
                  </div>
                  <span className="text-xs text-amber-800 font-semibold block">
                    {sheikh.title || "مقرئ ومدرس شرعي"}
                  </span>
                </div>
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span dir="ltr">{sheikh.email}</span>
                </span>

                {sheikh.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span dir="ltr">{sheikh.phone}</span>
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sheikh.halaqahName || "حلقة المربي"}</span>
                </span>

                {sheikh.createdAt && (
                  <span className="text-[11px] text-slate-400">
                    بتاريخ: {sheikh.createdAt}
                  </span>
                )}
              </div>

              {sheikh.bio && (
                <p className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-xl border border-amber-200/60 max-w-2xl leading-relaxed">
                  «{sheikh.bio}»
                </p>
              )}
            </div>

            {/* Approval / Rejection Actions */}
            <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
              <button
                type="button"
                onClick={() => handleReject(sheikh)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>رفض الطلب</span>
              </button>

              <button
                type="button"
                onClick={() => handleApprove(sheikh)}
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>قبول واعتماد الشيخ</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
