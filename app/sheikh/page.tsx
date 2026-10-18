import { formatDay, todayDateString } from "@/lib/dates";
import { Header } from "@/components/shared/Header";
import { BottomNav } from "@/components/shared/BottomNav";
import { SheikhStats } from "@/components/sheikh/SheikhStats";
import { SheikhWelcomeBanner } from "@/components/sheikh/SheikhWelcomeBanner";
import { SheikhQuestionsFeed } from "@/components/sheikh/SheikhQuestionsFeed";
import { StudentDirectory } from "@/components/sheikh/StudentDirectory";
import { requireRole } from "@/lib/auth";
import { dataService } from "@/lib/data-service";
import { Users, Sparkles } from "lucide-react";

export default async function SheikhDashboardPage() {
  const session = await requireRole("sheikh");

  const sheikhId = session.id;
  const sheikhUser = await dataService.getUserById(sheikhId);
  const students = await dataService.getStudentsForSheikh(sheikhId);
  const inquiries = await dataService.getStudentInquiriesForSheikh(sheikhId);

  // Compute stats
  const totalStudents = students.length;
  const avgCompletion =
    totalStudents > 0
      ? Math.round(
          students.reduce((acc, s) => acc + s.completionRate, 0) / totalStudents
        )
      : 0;

  const fajrCommittedCount = students.filter(
    (s) => s.todayLog?.fajr === "congregation" || s.todayLog?.fajr === "ontime"
  ).length;

  const needsAttentionCount = students.filter(
    (s) =>
      !s.todayLog ||
      s.todayLog.fajr === "missed" ||
      s.todayLog.fajr === "late" ||
      s.completionRate < 50
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] pb-24 md:pb-12 font-sans" dir="rtl">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* Welcome & Broadcast Banner (Supervision card removed) */}
        <SheikhWelcomeBanner
          sheikhName={sheikhUser?.name || session.name}
          halaqahName={sheikhUser?.halaqahName || `حلقة ${sheikhUser?.name || "المربي"}`}
          totalStudents={totalStudents}
        />

        {/* High-level stats indicators */}
        <SheikhStats
          totalStudents={totalStudents}
          avgCompletion={avgCompletion}
          fajrCommittedCount={fajrCommittedCount}
          needsAttentionCount={needsAttentionCount}
        />

        {/* Section: Student Inquiries & Questions */}
        <section id="inquiries" className="scroll-mt-20">
          <SheikhQuestionsFeed inquiries={inquiries} />
        </section>

        {/* Section: Students Monitoring Directory with Filters & Search */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                متابعة طلاب الحلقة لليوم ({formatDay(todayDateString(), { weekday: "long", day: "numeric", month: "long" })})
              </h2>
              <p className="text-xs text-slate-500">
                متابعة أداء الصلوات، الأوراد، الصيام، وملاحظات الطلاب اليومية
              </p>
            </div>
          </div>

          <StudentDirectory students={students} />
        </section>
      </main>

      <BottomNav role="sheikh" />
    </div>
  );
}
