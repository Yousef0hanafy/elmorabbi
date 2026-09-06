import { Header } from "@/components/shared/Header";
import { BottomNav } from "@/components/shared/BottomNav";
import { getSession } from "@/lib/auth";
import { dataService } from "@/lib/data-service";
import { SheikhFeedbackFeed } from "@/components/student/SheikhFeedbackFeed";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, UserCheck, ArrowRight } from "lucide-react";

export default async function StudentSheikhViewPage() {
  const session = await getSession();

  // Strict Authentication: Only students can view this page
  if (!session || session.role !== "student") {
    redirect("/login?role=student");
  }

  const studentId = session.id;
  const profile = await dataService.getStudentProfile(studentId);
  const sheikhId = profile?.sheikhId;
  const sheikh = sheikhId ? await dataService.getUserById(sheikhId) : null;
  const feedbacks = await dataService.getFeedbackForStudent(studentId);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] pb-24 md:pb-12">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/student"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 mb-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة إلى ورد اليوم</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              معلمي والتوجيهات التربوية
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة مباشرة مع الشيخ المشرف على استقامتك وتزكيتك
            </p>
          </div>

          <Link
            href="/student/choose-sheikh"
            className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors"
          >
            {sheikh ? "تغيير الشيخ المشرف" : "اختيار الشيخ المشرف"}
          </Link>
        </div>

        {/* Sheikh Info Card or Empty State */}
        {sheikh ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                {sheikh.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {sheikh.name}
                  </h2>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    المشرف المعتمد
                  </span>
                </div>
                <span className="text-xs text-amber-700 font-semibold block mt-0.5">
                  {sheikh.title}
                </span>
                <span className="text-xs text-slate-500 block mt-1 font-quran">
                  {sheikh.halaqahName}
                </span>
              </div>
            </div>

            <div className="text-right bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs w-full sm:w-auto">
              <span className="text-slate-400 block mb-0.5 text-[10px]">الحالة</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                يتابع وردك بانتظام
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-amber-200 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              لم تنضم لأي حلقة تربوية بعد
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              اختر شيخاً مربياً لمتابعة وردك اليومي، صلواتك، وأورادك القرآنية وتقديم النصح الأخوي المباشر لك.
            </p>
            <Link
              href="/student/choose-sheikh"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>استعراض المشايخ والانضمام لحلقة</span>
            </Link>
          </div>
        )}

        {/* Feedback messages */}
        <SheikhFeedbackFeed feedbacks={feedbacks} sheikhName={sheikh?.name} />
      </main>

      <BottomNav role="student" />
    </div>
  );
}
