"use client";

import { MIN_PASSWORD_LENGTH } from "@/lib/validation";
import { useState, useTransition } from "react";
import { UserRecord } from "@/lib/data-service";
import {
  resetSheikhPasswordAction,
  createSheikhAction,
  updateSheikhProfileAction,
} from "@/lib/actions/admin-actions";
import {
  KeyRound,
  Plus,
  ShieldCheck,
  UserCheck,
  X,
  Check,
  Mail,
  Lock,
  Edit,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SheikhManagementListProps {
  sheikhs: UserRecord[];
}

export function SheikhManagementList({ sheikhs }: SheikhManagementListProps) {
  const [passwordSheikh, setPasswordSheikh] = useState<UserRecord | null>(null);
  const [editSheikh, setEditSheikh] = useState<UserRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const INITIAL_LIMIT = 4;
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const visibleSheikhs = sheikhs.slice(0, limit);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setErrorMessage(null);
    startTransition(async () => {
      const res = await resetSheikhPasswordAction(formData);
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }
      setSuccessMessage("تم تحديث كلمة المرور بنجاح");
      setTimeout(() => {
        setSuccessMessage(null);
        setPasswordSheikh(null);
      }, 1500);
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setErrorMessage(null);
    startTransition(async () => {
      const res = await updateSheikhProfileAction(formData);
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }
      setSuccessMessage("تم تحديث بيانات الشيخ بنجاح");
      setTimeout(() => {
        setSuccessMessage(null);
        setEditSheikh(null);
      }, 1500);
    });
  };

  const handleCreateSheikh = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setErrorMessage(null);
    startTransition(async () => {
      const res = await createSheikhAction(formData);
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }
      setIsAddModalOpen(false);
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-700" />
            <span>إدارة حسابات وبيانات المشايخ</span>
          </h2>
          <p className="text-xs text-slate-500 font-quran mt-0.5">
            تعديل بيانات الحسابات، إعادة تعيين كلمات المرور في حال نسيانها، وإضافة مشايخ جدد
          </p>
        </div>

        <button
          onClick={() => { setErrorMessage(null); setIsAddModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة شيخ جديد</span>
        </button>
      </div>

      {/* Sheikhs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleSheikhs.map((sheikh) => (
          <div
            key={sheikh.id}
            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all flex flex-col justify-between gap-4 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  {sheikh.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {sheikh.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-quran block mb-1">
                    {sheikh.title}
                  </span>
                  <div className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md font-medium">
                    <span>حلقة:</span>
                    <span>{sheikh.halaqahName}</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                معتمد
              </span>
            </div>

            {/* Email info & Actions */}
            <div className="pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{sheikh.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setErrorMessage(null); setEditSheikh(sheikh); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  title="تعديل بيانات الشيخ والحلقة"
                >
                  <Edit className="w-3 h-3" />
                  <span>تعديل</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setErrorMessage(null); setPasswordSheikh(sheikh); }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>كلمة المرور</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sheikhs.length > limit ? (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setLimit((prev) => prev + 4)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ChevronDown className="w-4 h-4 text-emerald-700" />
            <span>عرض المزيد من المشايخ (+{sheikhs.length - limit} متبقي)</span>
          </button>
          <button
            type="button"
            onClick={() => setLimit(sheikhs.length)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            عرض الكل ({sheikhs.length})
          </button>
        </div>
      ) : sheikhs.length > INITIAL_LIMIT ? (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setLimit(INITIAL_LIMIT)}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 bg-white px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <span>طي القائمة وعرض أول {INITIAL_LIMIT} مشايخ فقط</span>
            <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      ) : null}

      {/* Modal: Reset Sheikh Password */}
      {passwordSheikh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-amber-600 font-bold block">إدارة الأمان</span>
                <h3 className="font-bold text-slate-900 text-base">
                  تغيير كلمة مرور: {passwordSheikh.name}
                </h3>
              </div>
              <button
                onClick={() => setPasswordSheikh(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMessage ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-center justify-center">
                <Check className="w-4 h-4" />
                <span>{successMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
              {errorMessage && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {errorMessage}
                </div>
              )}
                <input type="hidden" name="sheikhId" value={passwordSheikh.id} />

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    البريد الإلكتروني للشيخ
                  </label>
                  <input
                    type="text"
                    disabled
                    value={passwordSheikh.email}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-100 text-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      name="newPassword"
                      type="text"
                      required
                      minLength={MIN_PASSWORD_LENGTH}
                      autoComplete="new-password"
                      placeholder="أدخل كلمة المرور الجديدة"
                      className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50 text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    يمكنك كتابة كلمة المرور الجديدة وتزويد الشيخ بها لتسجيل الدخول فوراً.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPasswordSheikh(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isPending ? "جاري الحفظ..." : "حفظ كلمة المرور"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Edit Sheikh Profile */}
      {editSheikh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-emerald-700 font-bold block">تعديل الملف</span>
                <h3 className="font-bold text-slate-900 text-base">
                  تعديل بيانات: {editSheikh.name}
                </h3>
              </div>
              <button
                onClick={() => setEditSheikh(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMessage ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-center justify-center">
                <Check className="w-4 h-4" />
                <span>{successMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
              {errorMessage && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {errorMessage}
                </div>
              )}
                <input type="hidden" name="sheikhId" value={editSheikh.id} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      اسم الشيخ
                    </label>
                    <input
                      name="name"
                      defaultValue={editSheikh.name}
                      required
                      className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:border-emerald-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={editSheikh.email}
                      required
                      className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:border-emerald-500 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      اسم الحلقة
                    </label>
                    <input
                      name="halaqahName"
                      defaultValue={editSheikh.halaqahName}
                      required
                      className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:border-emerald-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      الصفة أو اللقب العلمي
                    </label>
                    <input
                      name="title"
                      defaultValue={editSheikh.title}
                      required
                      className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:border-emerald-500 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    النبذة التعريفية
                  </label>
                  <textarea
                    name="bio"
                    rows={2}
                    defaultValue={editSheikh.bio || ""}
                    className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:border-emerald-500 text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditSheikh(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md transition-all"
                  >
                    {isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add New Sheikh */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-emerald-700 font-bold block">إضافة مربٍ جديد</span>
                <h3 className="font-bold text-slate-900 text-base">
                  إنشاء حساب شيخ / معلم قرآن
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSheikh} className="space-y-3.5 text-xs">
              {errorMessage && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {errorMessage}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    اسم الشيخ
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="فضيلة الشيخ..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:border-emerald-500 transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    البريد الإلكتروني (لتسجيل الدخول)
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="sheikh@example.com"
                    className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:border-emerald-500 transition-all text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    كلمة المرور الابتدائية
                  </label>
                  <input
                    name="password"
                    type="text"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                    placeholder={`${MIN_PASSWORD_LENGTH} أحرف على الأقل`}
                    className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:border-emerald-500 transition-all text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    اسم الحلقة
                  </label>
                  <input
                    name="halaqahName"
                    required
                    placeholder="مثال: حلقة الهدى والنور"
                    className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:border-emerald-500 transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  الصفة أو اللقب العلمي
                </label>
                <input
                  name="title"
                  required
                  placeholder="مثال: إمام ومدرس التجويد، مجاز في القراءات"
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:border-emerald-500 transition-all text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  نبذة تعريفية (اختياري)
                </label>
                <textarea
                  name="bio"
                  rows={2}
                  placeholder="نبذة مختصرة عن الشيخ ومنهجه التربوي..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:border-emerald-500 transition-all text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md transition-all"
                >
                  {isPending ? "جاري الحفظ..." : "حفظ وإنشاء حساب الشيخ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
