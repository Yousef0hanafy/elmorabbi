import { Header } from "@/components/shared/Header";
import { StudentBottomNav } from "@/components/shared/RoleBottomNav";
import { TodayProgress } from "@/components/student/TodayProgress";
import { PrayerTracker } from "@/components/student/PrayerTracker";
import { QuranTracker } from "@/components/student/QuranTracker";
import { AdhkarTracker } from "@/components/student/AdhkarTracker";
import { FastingTracker } from "@/components/student/FastingTracker";
import { DailyReflection } from "@/components/student/DailyReflection";
import { LatestGuidance } from "@/components/student/LatestGuidance";
import { requireRole } from "@/lib/auth";
import { countCompletedDeeds, TOTAL_DAILY_DEEDS } from "@/lib/scoring";
import { dataService } from "@/lib/data-service";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await requireRole("student");

  const studentId = session.id;
  const studentName = session.name;

  const [profile, todayLog, feedbacks] = await Promise.all([
    dataService.getStudentProfile(studentId),
    dataService.getTodayLog(studentId),
    dataService.getFeedbackForStudent(studentId),
  ]);

  const hasSheikh = Boolean(profile?.sheikhId);
  const completedDeeds = countCompletedDeeds(todayLog);
  const streakDays = profile?.streakDays ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] pb-24 md:pb-12 font-sans" dir="rtl">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* Sheikh Notice Banner if not yet assigned */}
        {!hasSheikh && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="text-amber-900 font-medium">
                أنت غير منضم لحلقة شيخ حالياً لمتابعة وردك اليومي وتلقي التوجيهات.
              </span>
            </div>
            <Link
              href="/student/choose-sheikh"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 transition-colors"
            >
              اختيار الشيخ المربي
            </Link>
          </div>
        )}

        {/* Hero & Daily Progress */}
        <TodayProgress
          completedDeeds={completedDeeds}
          totalDeeds={TOTAL_DAILY_DEEDS}
          streakDays={streakDays}
          studentName={studentName}
        />

        {/* 5 Prayers Tracker */}
        <PrayerTracker initialLog={todayLog} />

        {/* Quran, Adhkar & Fasting Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuranTracker
            initialRead={todayLog.quranRead}
            initialPages={todayLog.quranPages}
          />
          <AdhkarTracker
            initialMorning={todayLog.adhkarMorning}
            initialEvening={todayLog.adhkarEvening}
          />
        </div>

        <FastingTracker initialFasting={todayLog.fasting} />

        <DailyReflection initialNotes={todayLog.notes || ""} />

        {hasSheikh && <LatestGuidance latest={feedbacks[0]} total={feedbacks.length} />}
      </main>

      <StudentBottomNav studentId={session.id} />
    </div>
  );
}
