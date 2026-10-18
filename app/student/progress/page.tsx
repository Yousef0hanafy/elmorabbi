import { Header } from "@/components/shared/Header";
import { StudentBottomNav } from "@/components/shared/RoleBottomNav";
import { WeeklyProgressChart } from "@/components/student/WeeklyProgressChart";
import { BadgesSection } from "@/components/student/BadgesSection";
import { HalaqahRank } from "@/components/student/HalaqahRank";
import { requireRole } from "@/lib/auth";
import { dataService } from "@/lib/data-service";
import { countOnTimePrayers } from "@/lib/scoring";

export default async function StudentProgressPage() {
  const session = await requireRole("student");
  const studentId = session.id;

  const [profile, todayLog, historyLogs] = await Promise.all([
    dataService.getStudentProfile(studentId),
    dataService.getTodayLog(studentId),
    dataService.getStudentHistory(studentId, 7),
  ]);

  const streakDays = profile?.streakDays ?? 0;
  const weeklyQuranPages = historyLogs.reduce((acc, log) => acc + log.quranPages, 0);

  // Rank is computed on the server; peers' names and records never reach the browser
  let rank: number | null = null;
  let total = 0;
  let halaqahName: string | undefined;
  if (profile?.sheikhId) {
    const [peers, sheikh] = await Promise.all([
      dataService.getStudentsForSheikh(profile.sheikhId),
      dataService.getUserById(profile.sheikhId),
    ]);
    const ranked = [...peers].sort(
      (a, b) => b.profile.streakDays - a.profile.streakDays || b.completionRate - a.completionRate
    );
    const index = ranked.findIndex((p) => p.id === studentId);
    rank = index >= 0 ? index + 1 : null;
    total = ranked.length;
    halaqahName = sheikh?.halaqahName;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] pb-24 md:pb-12">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">تقدّمي</h1>
          <p className="text-xs text-slate-500 mt-0.5">ثباتك خلال الأسبوع، أوسمتك، وترتيبك في الحلقة</p>
        </div>

        <WeeklyProgressChart history={historyLogs} />

        <BadgesSection
          streakDays={streakDays}
          onTimePrayersToday={countOnTimePrayers(todayLog)}
          fajrInCongregation={todayLog.fajr === "congregation"}
          adhkarCompletedToday={todayLog.adhkarMorning && todayLog.adhkarEvening}
          isFasting={todayLog.fasting !== "none"}
          weeklyQuranPages={weeklyQuranPages}
        />

        <HalaqahRank rank={rank} total={total} streakDays={streakDays} halaqahName={halaqahName} />
      </main>

      <StudentBottomNav studentId={session.id} />
    </div>
  );
}
