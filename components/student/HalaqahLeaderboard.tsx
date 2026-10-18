"use client";

import { useState } from "react";
import { Flame, Medal, ChevronDown, ChevronUp } from "lucide-react";

interface PeerStudent {
  id: string;
  name: string;
  avatar?: string;
  profile?: {
    streakDays: number;
    level: string;
  };
  completedDeeds: number;
  completionRate: number;
}

interface HalaqahLeaderboardProps {
  peers: PeerStudent[];
  currentStudentId: string;
  halaqahName?: string;
}

export function HalaqahLeaderboard({
  peers,
  currentStudentId,
  halaqahName = "حلقة المربي",
}: HalaqahLeaderboardProps) {
  const [expanded, setExpanded] = useState(false);
  const TOP_LIMIT = 5;

  // Sort peers by streakDays desc, then completionRate desc
  const sortedPeers = [...peers].sort((a, b) => {
    const streakA = a.profile?.streakDays || 0;
    const streakB = b.profile?.streakDays || 0;
    if (streakB !== streakA) return streakB - streakA;
    return (b.completionRate || 0) - (a.completionRate || 0);
  });

  const myIndex = sortedPeers.findIndex((s) => s.id === currentStudentId);
  const displayedPeers = expanded ? sortedPeers : sortedPeers.slice(0, TOP_LIMIT);
  const showPinnedMe = !expanded && myIndex >= TOP_LIMIT;

  const renderStudentCard = (student: PeerStudent, index: number) => {
    const isMe = student.id === currentStudentId;
    const streak = student.profile?.streakDays || 0;

    // Rank Badges
    let rankBadge = (
      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
        {index + 1}
      </span>
    );

    if (index === 0) {
      rankBadge = (
        <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white flex items-center justify-center text-sm font-black shadow-sm shrink-0">
          🥇
        </span>
      );
    } else if (index === 1) {
      rankBadge = (
        <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 text-white flex items-center justify-center text-sm font-black shadow-sm shrink-0">
          🥈
        </span>
      );
    } else if (index === 2) {
      rankBadge = (
        <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white flex items-center justify-center text-sm font-black shadow-sm shrink-0">
          🥉
        </span>
      );
    }

    return (
      <div
        key={student.id}
        className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
          isMe
            ? "bg-emerald-50/70 border-emerald-300 shadow-xs ring-1 ring-emerald-300/60"
            : "bg-gray-50/70 border-gray-100 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          {rankBadge}

          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0">
            {student.name.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-gray-900">{student.name}</span>
              {isMe && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white">
                  أنت
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-500 block">
              {student.profile?.level || "طالب حلقة"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50/80 px-2 py-1 rounded-xl border border-amber-200/60">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>{streak} يوماً</span>
          </div>

          <div className="text-emerald-700 font-bold hidden sm:block">
            {student.completionRate}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-44 h-44 bg-amber-50/60 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Medal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">لوحة الشرف والتنافس المحمود</h3>
            <p className="text-xs text-gray-500">أوائل حلقة {halaqahName} الأكثر مواظبة على الأوراد</p>
          </div>
        </div>

        <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
          ﴿وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ﴾
        </div>
      </div>

      {/* Leaderboard List or Empty State */}
      {sortedPeers.length === 0 ? (
        <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-center space-y-1.5 relative z-10">
          <Medal className="w-8 h-8 text-amber-500 mx-auto" />
          <h4 className="text-xs font-bold text-slate-800">لا يوجد طلاب متنافسون في هذه الحلقة بعد</h4>
          <p className="text-[11px] text-slate-500">
            انضم إلى حلقة شيخ أو بادر بإنجاز أورادك لتتصدر قائمة الشرف والتنافس المحمود.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 relative z-10">
          {displayedPeers.map((student, index) => renderStudentCard(student, index))}

          {showPinnedMe && (
            <>
              <div className="relative py-1 flex items-center justify-center my-1">
                <div className="border-t border-dashed border-gray-200 w-full absolute" />
                <span className="bg-white px-3 text-[10px] text-gray-400 relative z-10 font-medium">
                  ••• ترتيبك الحالي في الحلقة •••
                </span>
              </div>
              {renderStudentCard(sortedPeers[myIndex], myIndex)}
            </>
          )}

          {sortedPeers.length > TOP_LIMIT && (
            <div className="pt-2">
              {!expanded ? (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="w-full py-2.5 px-4 bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 border border-amber-200/70 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>عرض كامل لوحة الشرف ({sortedPeers.length} طالب)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
                </button>
              ) : (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>طي القائمة وعرض الأوائل الـ {TOP_LIMIT} فقط</span>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
        <span>تُحدّث لوحة الشرف يومياً بناءً على إنجاز الأوراد وسلسلة الالتزام.</span>
        <span className="font-semibold text-emerald-700">ثبتنا الله وإياكم على طاعته</span>
      </div>
    </div>
  );
}
