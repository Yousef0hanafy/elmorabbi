import { Header } from "@/components/shared/Header";
import { BottomNav } from "@/components/shared/BottomNav";
import { TodayProgress } from "@/components/student/TodayProgress";
import { PrayerTracker } from "@/components/student/PrayerTracker";
import { QuranTracker } from "@/components/student/QuranTracker";
import { AdhkarTracker } from "@/components/student/AdhkarTracker";
import { FastingTracker } from "@/components/student/FastingTracker";
import { WeeklyProgressChart } from "@/components/student/WeeklyProgressChart";
import { BadgesSection } from "@/components/student/BadgesSection";
import { HalaqahLeaderboard } from "@/components/student/HalaqahLeaderboard";
import { DailyReflection } from "@/components/student/DailyReflection";
import { SheikhFeedbackFeed } from "@/components/student/SheikhFeedbackFeed";
import { getSession } from "@/lib/auth";
import { dataService } from "@/lib/data-service";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/login?role=student");
  }

  const studentId = session.id;
  const studentName = session.name;

  const profile = await dataService.getStudentProfile(studentId);
  const todayLog = await dataService.getTodayLog(studentId);
  const feedbacks = await dataService.getFeedbackForStudent(studentId);
  const historyLogs = await dataService.getStudentHistory(studentId, 7);

  const sheikh = profile?.sheikhId
    ? await dataService.getUserById(profile.sheikhId)
    : null;

  const peers = profile?.sheikhId
    ? await dataService.getStudentsForSheikh(profile.sheikhId)
    : [];

  // Compute completed deeds
  let completedDeeds = 0;
  if (todayLog.fajr === "congregation" || todayLog.fajr === "ontime") completedDeeds++;
  if (todayLog.dhuhr === "congregation" || todayLog.dhuhr === "ontime") completedDeeds++;
  if (todayLog.asr === "congregation" || todayLog.asr === "ontime") completedDeeds++;
  if (todayLog.maghrib === "congregation" || todayLog.maghrib === "ontime") completedDeeds++;
  if (todayLog.isha === "congregation" || todayLog.isha === "ontime") completedDeeds++;
  if (todayLog.quranRead) completedDeeds++;
  if (todayLog.adhkarMorning) completedDeeds++;
  if (todayLog.adhkarEvening) completedDeeds++;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] pb-24 md:pb-12 font-sans" dir="rtl">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* Sheikh Notice Banner if not yet assigned */}
        {!sheikh && (
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
          totalDeeds={8}
          streakDays={profile?.streakDays || 14}
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

        {/* Fasting Tracker Full Width */}
        <FastingTracker initialFasting={todayLog.fasting} />

        {/* Weekly Commitment Analytics */}
        <WeeklyProgressChart history={historyLogs} />

        {/* Gamification Badges Section */}
        <BadgesSection
          streakDays={profile?.streakDays || 14}
          completedDeedsToday={completedDeeds}
          fajrInCongregation={todayLog.fajr === "congregation"}
          isFasting={todayLog.fasting !== "none"}
        />

        {/* Halaqah Leaderboard & Sheikh Feedbacks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HalaqahLeaderboard
            peers={peers}
            currentStudentId={studentId}
            halaqahName={sheikh?.title || "المربي"}
          />
          <SheikhFeedbackFeed
            feedbacks={feedbacks}
            sheikhName={sheikh?.name}
          />
        </div>

        {/* Daily Reflection & Notes */}
        <DailyReflection initialNotes={todayLog.notes || ""} />
      </main>

      <BottomNav role="student" />
    </div>
  );
}
