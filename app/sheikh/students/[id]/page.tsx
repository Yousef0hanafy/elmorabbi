import { Header } from "@/components/shared/Header";
import { BottomNav } from "@/components/shared/BottomNav";
import { requireRole } from "@/lib/auth";
import { dataService } from "@/lib/data-service";
import { sendFeedbackAction } from "@/lib/actions/sheikh-actions";
import { FEEDBACK_TYPES, isOneOf } from "@/lib/validation";
import { StudentFeedbackHistory } from "@/components/sheikh/StudentFeedbackHistory";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  User,
  Flame,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  BookOpen,
  ShieldCheck,
  MessageSquareQuote,
  Send,
  Phone,
  Mail,
} from "lucide-react";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;
  const session = await requireRole("sheikh");

  // A sheikh may only view students enrolled in their own halaqah
  if (!(await dataService.isStudentOfSheikh(id, session.id))) {
    notFound();
  }

  const student = await dataService.getUserById(id);

  if (!student) {
    notFound();
  }

  const profile = await dataService.getStudentProfile(id);
  const todayLog = await dataService.getTodayLog(id);
  const history = await dataService.getStudentHistory(id, 7);
  const feedbacks = await dataService.getFeedbackForStudent(id);

  async function handleSendFeedback(formData: FormData) {
    "use server";
    const content = formData.get("content") as string;
    const rawType = formData.get("type");
    const type = isOneOf(FEEDBACK_TYPES, rawType) ? rawType : "advice";
    if (content) {
      await sendFeedbackAction(id, content, type);
      redirect(`/sheikh/students/${id}`);
    }
  }

  const getPrayerBadge = (status?: string) => {
    switch (status) {
      case "congregation":
        return { label: "جماعة", bg: "bg-emerald-100 text-emerald-800" };
      case "ontime":
        return { label: "في وقتها", bg: "bg-teal-100 text-teal-800" };
      case "late":
        return { label: "قضاء", bg: "bg-amber-100 text-amber-800" };
      default:
        return { label: "فائتة", bg: "bg-rose-100 text-rose-800" };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] pb-24 md:pb-12">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        <Link
          href="/sheikh"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة طلاب الحلقة</span>
        </Link>

        {/* Student Profile Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {student.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {student.name}
                </h1>
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full">
                  {profile?.level || "طالب"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {student.email}
                </span>
                {student.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {student.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-amber-900 block leading-tight">
                {profile?.streakDays || 0} يوماً
              </span>
              <span className="text-[11px] text-amber-700 font-medium">
                سلسلة الاستقامة المتواصلة
              </span>
            </div>
          </div>
        </div>

        {/* Today's Detailed Record */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            سجل اليوم ({todayLog.date})
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {(
              [
                { key: "fajr", name: "الفجر" },
                { key: "dhuhr", name: "الظهر" },
                { key: "asr", name: "العصر" },
                { key: "maghrib", name: "المغرب" },
                { key: "isha", name: "العشاء" },
              ] as const
            ).map((p) => {
              const badge = getPrayerBadge(todayLog[p.key]);
              return (
                <div
                  key={p.key}
                  className={`p-3 rounded-xl border text-center ${badge.bg}`}
                >
                  <span className="text-xs font-semibold block">{p.name}</span>
                  <span className="text-sm font-bold block mt-0.5">{badge.label}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-1">ورد القرآن الكريم:</span>
              <span className="text-slate-600">
                {todayLog.quranRead ? `قرأ بتوفيق الله (${todayLog.quranPages} صفحات)` : "لم يقرأ بعد"}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-1">حصن المسلم:</span>
              <span className="text-slate-600">
                أذكار الصباح: {todayLog.adhkarMorning ? "قرأها ✓" : "لم يقرأ"} | أذكار المساء: {todayLog.adhkarEvening ? "قرأها ✓" : "لم يقرأ"}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-1">الصيام:</span>
              <span className="text-slate-600 font-medium">
                {todayLog.fasting === "voluntary"
                  ? "صائم تطوعاً (سُنّة) 🌙"
                  : todayLog.fasting === "fard"
                  ? "صائم فرضاً (قضاء / نذر) 🌙"
                  : "مُفطر اليوم"}
              </span>
            </div>
          </div>

          {todayLog.notes && (
            <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs font-quran text-amber-900">
              <strong className="block text-[11px] text-amber-800 mb-1">خاطرة الطالب / سؤاله لليوم:</strong>
              «{todayLog.notes}»
            </div>
          )}
        </div>

        {/* 7-Day History Trend */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              سجل استقامة الطالب لآخر 7 أيام
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              متابعة ثبات الأداء
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-3 pr-2">التاريخ</th>
                  <th className="pb-3">الفجر</th>
                  <th className="pb-3">الظهر</th>
                  <th className="pb-3">العصر</th>
                  <th className="pb-3">المغرب</th>
                  <th className="pb-3">العشاء</th>
                  <th className="pb-3">القرآن</th>
                  <th className="pb-3">الأذكار</th>
                  <th className="pb-3 pl-2">الصيام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => {
                  const fajrBadge = getPrayerBadge(h.fajr);
                  const isFasting = h.fasting && h.fasting !== "none";

                  return (
                    <tr key={h.id || h.date} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pr-2 font-bold text-slate-800 whitespace-nowrap">
                        {h.date}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${fajrBadge.bg}`}>
                          {fajrBadge.label}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">
                        {h.dhuhr === "congregation" ? "جماعة" : h.dhuhr === "ontime" ? "وقتها" : "قضاء/فائتة"}
                      </td>
                      <td className="py-3 text-slate-600">
                        {h.asr === "congregation" ? "جماعة" : h.asr === "ontime" ? "وقتها" : "قضاء/فائتة"}
                      </td>
                      <td className="py-3 text-slate-600">
                        {h.maghrib === "congregation" ? "جماعة" : h.maghrib === "ontime" ? "وقتها" : "قضاء/فائتة"}
                      </td>
                      <td className="py-3 text-slate-600">
                        {h.isha === "congregation" ? "جماعة" : h.isha === "ontime" ? "وقتها" : "قضاء/فائتة"}
                      </td>
                      <td className="py-3 font-medium text-slate-700 whitespace-nowrap">
                        {h.quranRead ? `${h.quranPages} ص` : "—"}
                      </td>
                      <td className="py-3 text-[11px] text-slate-600 whitespace-nowrap">
                        {h.adhkarMorning && h.adhkarEvening
                          ? "الصباح والمساء ✓"
                          : h.adhkarMorning
                          ? "الصباح فقط"
                          : h.adhkarEvening
                          ? "المساء فقط"
                          : "—"}
                      </td>
                      <td className="py-3 pl-2 whitespace-nowrap">
                        {isFasting ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {h.fasting === "voluntary" ? "تطوع 🌙" : "فرض 🌙"}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Send Direct Advice Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <MessageSquareQuote className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              إرسال توجيه ونصيحة للطالب
            </h2>
          </div>

          <form action={handleSendFeedback} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                نوع التوجيه:
              </label>
              <select
                name="type"
                className="text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden focus:border-amber-500"
              >
                <option value="advice">نصيحة وتوجيه</option>
                <option value="praise">ثناء وتشجيع</option>
                <option value="warning">تنبيه أخوي</option>
                <option value="general">عام</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                نص التوجيه:
              </label>
              <textarea
                name="content"
                rows={3}
                required
                placeholder="اكتب توجيهك للطالب هنا، سيظهر له في لوحة ورده اليومي..."
                className="w-full text-sm rounded-xl border border-slate-200 p-3 bg-slate-50 text-slate-800 focus:outline-hidden focus:border-amber-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال التوجيه الآن</span>
            </button>
          </form>
        </div>

        {/* Previous Feedback History */}
        <StudentFeedbackHistory feedbacks={feedbacks} />
      </main>

      <BottomNav role="sheikh" />
    </div>
  );
}
