"use client";

import { useState, useTransition } from "react";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Dialog } from "@/components/ui/Dialog";
import { reassignStudentSheikhAction } from "@/lib/actions/admin-actions";
import type { UserRecord } from "@/lib/data-service";
import {
  GraduationCap,
  Flame,
  Check,
  X,
  Phone,
  Mail,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface StudentItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  streakDays: number;
  level: string;
  status: string;
  sheikhId?: string | null;
  sheikhName: string;
}

interface StudentsManagementListProps {
  students: StudentItem[];
  sheikhs: UserRecord[];
}

export function StudentsManagementList({
  students,
  sheikhs,
}: StudentsManagementListProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const INITIAL_LIMIT = 5;
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const visibleStudents = students.slice(0, limit);

  const handleReassign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setErrorMessage(null);
    startTransition(async () => {
      const res = await reassignStudentSheikhAction(formData);
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }
      setSuccessMsg("تم نقل وتعيين الطالب للشيخ المشرف بنجاح");
      setTimeout(() => {
        setSuccessMsg(null);
        setSelectedStudent(null);
      }, 1500);
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-700" />
            <span>دليل ومتابعة الطلاب المسجلين</span>
          </h2>
          <p className="text-xs text-slate-500 font-quran mt-0.5">
            متابعة استقامة الطلاب، حلقاتهم، ونقل الطلاب بين المشايخ والمربين
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full self-start sm:self-auto">
          إجمالي الطلاب: {students.length}
        </span>
      </div>

      <div className="space-y-3">
        {visibleStudents.map((student) => (
          <div
            key={student.id}
            className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0">
                {student.name[0]}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {student.name}
                  </h3>
                  <span className="text-[10px] font-semibold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md">
                    {student.level}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {student.email}
                  </span>
                  {student.phone && (
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {student.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Sheikh & Streak & Action */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{student.streakDays} يوم</span>
                </div>

                <div className="text-right text-xs">
                  <span className="text-[10px] text-slate-400 block">الشيخ المربي:</span>
                  <span className="font-bold text-slate-800">
                    {student.sheikhName}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setErrorMessage(null); setSelectedStudent(student); }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">نقل لحلقة أخرى</span>
                <span className="sm:hidden">نقل</span>
              </button>
            </div>
          </div>
        ))}

        {students.length > limit ? (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setLimit((prev) => prev + 5)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <ChevronDown className="w-4 h-4 text-emerald-700" />
              <span>عرض المزيد من الطلاب (+{students.length - limit} متبقي)</span>
            </button>
            <button
              type="button"
              onClick={() => setLimit(students.length)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              عرض الكل ({students.length})
            </button>
          </div>
        ) : students.length > INITIAL_LIMIT ? (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setLimit(INITIAL_LIMIT)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 bg-white px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <span>طي القائمة وعرض أول {INITIAL_LIMIT} طلاب فقط</span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Modal: Reassign Sheikh */}
      {selectedStudent && (
        <Dialog onClose={() => setSelectedStudent(null)} label="نقل الطالب لحلقة أخرى" className="max-w-md rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs text-emerald-700 font-bold block">إدارة الحلقات</span>
              <h3 className="font-bold text-slate-900 text-base">
                نقل الطالب: {selectedStudent.name}
              </h3>
            </div>
            <button
              aria-label="إغلاق"
              onClick={() => setSelectedStudent(null)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {successMsg ? (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-center justify-center">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleReassign} className="space-y-4 text-xs">
            <ErrorAlert message={errorMessage} />
              <input type="hidden" name="studentId" value={selectedStudent.id} />

              <div>
                <label className="text-slate-500 block mb-1">الشيخ الحالي:</label>
                <span className="font-bold text-slate-800 block bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {selectedStudent.sheikhName}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  اختر الشيخ المربي الجديد
                </label>
                <select
                  name="newSheikhId"
                  required
                  defaultValue={selectedStudent.sheikhId || ""}
                  className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 text-xs font-medium"
                >
                  {sheikhs.map((sh) => (
                    <option key={sh.id} value={sh.id}>
                      {sh.name} — {sh.halaqahName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md transition-all"
                >
                  {isPending ? "جاري النقل..." : "تأكيد النقل للحلقة"}
                </button>
              </div>
            </form>
          )}
        </Dialog>
      )}
    </div>
  );
}
