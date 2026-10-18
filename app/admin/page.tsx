import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { dataService } from "@/lib/data-service";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { PendingSheikhsList } from "@/components/admin/PendingSheikhsList";
import { SheikhManagementList } from "@/components/admin/SheikhManagementList";
import { StudentsManagementList } from "@/components/admin/StudentsManagementList";
import { RecentActivityFeed } from "@/components/admin/RecentActivityFeed";
import { logoutAction } from "@/lib/actions/auth-actions";
import Link from "next/link";
import {
  Shield,
  UserCheck,
  GraduationCap,
  Flame,
  CheckCircle2,
  LogOut,
} from "lucide-react";

export default async function AdminPage() {
  const session = await getSession();

  // If not authenticated as Admin, show dedicated Admin Login Form
  if (session?.role !== "admin") {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0d1715]" />}>
        <AdminLoginForm />
      </Suspense>
    );
  }

  const sheikhs = await dataService.getAllSheikhs();
  const pendingSheikhs = await dataService.getPendingSheikhs();
  const students = await dataService.getAllStudentsWithDetails();
  const kpis = await dataService.getOperationalKPIs();
  const feedbacks = await dataService.getRecentFeedbacksAll(5);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] pb-16 font-sans" dir="rtl">
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex items-center gap-3 group hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base text-white block leading-tight">
                  لوحة الإدارة المركزية
                </span>
                <span className="text-[11px] text-emerald-400 font-quran">
                  منصة المربي • العودة للرئيسية
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right text-xs">
                <span className="font-bold text-slate-200">{session.name}</span>
                <span className="text-emerald-400 text-[10px]">مشرف النظام العام</span>
              </div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل الخروج</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8 flex-1">
        {/* Executive Platform KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900 block leading-tight">
                  {kpis.activeSheikhs}
                </span>
                {pendingSheikhs.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                    +{pendingSheikhs.length} بانتظار الاعتماد
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 font-medium">مشايخ معتمدون</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900 block leading-tight">
                {kpis.totalStudents}
              </span>
              <span className="text-xs text-slate-500 font-medium">طلاب مسجلون</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900 block leading-tight">
                {kpis.todayLoggedDeeds}
              </span>
              <span className="text-xs text-slate-500 font-medium">عبادات مسجلة اليوم</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900 block leading-tight">
                {kpis.avgStreak} يوماً
              </span>
              <span className="text-xs text-slate-500 font-medium">متوسط استقامة الطلاب</span>
            </div>
          </div>
        </div>

        {/* Section 1: Pending Sheikh Approval Requests */}
        <PendingSheikhsList pendingSheikhs={pendingSheikhs} />

        {/* Section 2: Sheikhs Management */}
        <SheikhManagementList sheikhs={sheikhs} />

        {/* Section 3: Students Directory & Reassign */}
        <StudentsManagementList students={students} sheikhs={sheikhs} />

        {/* Section 4: Recent Activity & Feedback Messages */}
        <RecentActivityFeed feedbacks={feedbacks} />
      </main>
    </div>
  );
}
