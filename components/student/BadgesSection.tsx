"use client";

import { useState } from "react";
import { Award, Lock, Sparkles, CheckCircle2, Trophy, X } from "lucide-react";
import confetti from "canvas-confetti";

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "prayer" | "quran" | "dhikr" | "fasting" | "streak";
  isUnlocked: boolean;
  progress: string;
  hadith?: string;
}

interface BadgesSectionProps {
  streakDays: number;
  onTimePrayersToday: number;
  fajrInCongregation: boolean;
  adhkarCompletedToday: boolean;
  isFasting: boolean;
  weeklyQuranPages: number;
}

const QURAN_BADGE_PAGES = 50;

export function BadgesSection({
  streakDays,
  onTimePrayersToday,
  fajrInCongregation,
  adhkarCompletedToday,
  isFasting,
  weeklyQuranPages,
}: BadgesSectionProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  const badges: BadgeItem[] = [
    {
      id: "streak-14",
      title: "شعلة الاستمرار",
      description: "المحافظة على الصلوات الخمس 14 يوماً متواصلاً دون انقطاع.",
      icon: "🔥",
      category: "streak",
      isUnlocked: streakDays >= 14,
      progress: `${Math.min(streakDays, 14)} / 14 يوماً`,
      hadith: "«أحبُّ الأعمالِ إلى اللهِ أدْوَمُها وإنْ قَلَّ»",
    },
    {
      id: "fajr-champion",
      title: "فارس الفجر",
      description: "المحافظة على صلاة الفجر في جماعة المسجد وإدراك تكبيرة الإحرام.",
      icon: "🌅",
      category: "prayer",
      isUnlocked: fajrInCongregation,
      progress: fajrInCongregation ? "متحقق اليوم" : "صلّ الفجر جماعة",
      hadith: "«مَن صلَّى الصُّبحَ في جماعةٍ فكأنَّما صلَّى اللَّيلَ كُلَّه»",
    },
    {
      id: "quran-lover",
      title: "أنيس الفرقان",
      description: `قراءة ${QURAN_BADGE_PAGES} صفحة على الأقل من القرآن الكريم خلال آخر 7 أيام بتدبر وخشوع.`,
      icon: "📖",
      category: "quran",
      isUnlocked: weeklyQuranPages >= QURAN_BADGE_PAGES,
      progress: `${Math.min(weeklyQuranPages, QURAN_BADGE_PAGES)} / ${QURAN_BADGE_PAGES} صفحة هذا الأسبوع`,
      hadith: "«اقرءوا القرآنَ فإنه يأتي يومَ القيامةِ شفيعًا لأصحابه»",
    },
    {
      id: "dhikr-constant",
      title: "ذاكر الله كثيراً",
      description: "المواظبة التامة على أذكار الصباح وأذكار المساء لتحصين النفس.",
      icon: "📿",
      category: "dhikr",
      isUnlocked: adhkarCompletedToday,
      progress: adhkarCompletedToday ? "محصن بالأذكار" : "أتمم الوردين اليوم",
      hadith: "«مَثَلُ الذي يَذْكُرُ رَبَّه والَّذي لا يَذْكُرُ رَبَّه؛ مَثَلُ الحَيِّ والمَيِّتِ»",
    },
    {
      id: "fasting-volunteer",
      title: "ريّان النوافل",
      description: "صيام يوم تطوع في سبيل الله (الإثنين أو الخميس أو الأيام البيض).",
      icon: "🌙",
      category: "fasting",
      isUnlocked: isFasting,
      progress: isFasting ? "صائم اليوم بنية طيبة" : "سجل صيامك القادم",
      hadith: "«إنَّ في الجَنَّةِ بابًا يُقالُ له: الرَّيّانُ، يَدْخُلُ منه الصّائِمُونَ»",
    },
    {
      id: "all-prayers",
      title: "حارس الصلوات",
      description: "أداء الصلوات الخمس المكتوبة جميعاً في أوقاتها دون أي تأخير.",
      icon: "🕌",
      category: "prayer",
      isUnlocked: onTimePrayersToday >= 5,
      progress: `${onTimePrayersToday} / 5 صلوات`,
      hadith: "«أولُ ما يُحاسَبُ به العبدُ يومَ القيامةِ الصلاةُ»",
    },
  ];

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  const handleBadgeClick = (badge: BadgeItem) => {
    setSelectedBadge(badge);
    if (badge.isUnlocked) {
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#10b981", "#3b82f6"],
        });
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">أوسمة الإنجاز والهمّة</h3>
            <p className="text-xs text-gray-500">شارات تحفيزية تُمنح تقديراً لثباتك على الطاعات</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          {unlockedCount} من {badges.length} مكتسبة
        </span>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {badges.map((badge) => (
          <button
            key={badge.id}
            type="button"
            onClick={() => handleBadgeClick(badge)}
            className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border text-center transition-all duration-200 group relative ${
              badge.isUnlocked
                ? "bg-gradient-to-b from-amber-50/70 to-emerald-50/40 border-amber-200/80 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5"
                : "bg-gray-50/60 border-gray-200/70 opacity-60 hover:opacity-80"
            }`}
          >
            {/* Status indicator icon */}
            <div className="absolute top-2 left-2">
              {badge.isUnlocked ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Lock className="w-3 h-3 text-gray-400" />
              )}
            </div>

            {/* Badge Icon Graphic */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2 transition-transform duration-200 group-hover:scale-110 ${
                badge.isUnlocked
                  ? "bg-white shadow-sm border border-amber-200"
                  : "bg-gray-200/60 grayscale"
              }`}
            >
              {badge.icon}
            </div>

            {/* Badge Name */}
            <div className="font-bold text-xs text-gray-800 line-clamp-1 mb-1">
              {badge.title}
            </div>

            {/* Badge Progress Status */}
            <div
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                badge.isUnlocked
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {badge.isUnlocked ? "مكتسب ✨" : "قيد السعي"}
            </div>
          </button>
        ))}
      </div>

      {/* Badge Details Dialog / Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 relative text-center">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 left-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-3xl mb-3 shadow-inner">
              {selectedBadge.icon}
            </div>

            <h4 className="font-bold text-gray-900 text-lg mb-1">{selectedBadge.title}</h4>

            <div className="inline-block mb-3">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  selectedBadge.isUnlocked
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {selectedBadge.isUnlocked ? "وسام مكتسب وموثق 🏆" : "وسام قيد التحقيق 🔒"}
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              {selectedBadge.description}
            </p>

            {selectedBadge.hadith && (
              <div className="bg-emerald-50 rounded-2xl p-3 text-xs text-emerald-900 border border-emerald-200 mb-4">
                <p className="italic font-medium">{selectedBadge.hadith}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-3 text-xs font-semibold text-gray-700 mb-4">
              التقدم الحالي: <span className="text-emerald-700">{selectedBadge.progress}</span>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
