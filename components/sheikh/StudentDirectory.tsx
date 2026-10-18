"use client";

import { useState } from "react";
import { needsFollowUp } from "@/lib/scoring";
import { StudentCard } from "./StudentCard";
import { Users, AlertTriangle, Sparkles, Search, ChevronDown } from "lucide-react";
import type { DailyLogRecord, StudentProfileRecord } from "@/lib/data-service";

interface StudentItem {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  profile: StudentProfileRecord;
  todayLog?: DailyLogRecord;
  completedDeeds: number;
  completionRate: number;
}

interface StudentDirectoryProps {
  students: StudentItem[];
}

export function StudentDirectory({ students }: StudentDirectoryProps) {
  const [filter, setFilter] = useState<"all" | "attention" | "high">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const INITIAL_LIMIT = 6;
  const [limit, setLimit] = useState(INITIAL_LIMIT);

  const needsAttention = (s: StudentItem) => needsFollowUp(s.todayLog);

  const isHighPerformer = (s: StudentItem) => s.completionRate >= 80;

  const filteredStudents = students.filter((s) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name?.toLowerCase().includes(q);
      const matchEmail = s.email?.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }

    // Category filter
    if (filter === "attention") return needsAttention(s);
    if (filter === "high") return isHighPerformer(s);
    return true;
  });

  const displayedStudents = filteredStudents.slice(0, limit);
  const hasMore = filteredStudents.length > limit;

  const attentionCount = students.filter(needsAttention).length;
  const highCount = students.filter(isHighPerformer).length;

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setLimit(INITIAL_LIMIT);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              filter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>كافة الطلاب ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilter("attention");
              setLimit(INITIAL_LIMIT);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              filter === "attention"
                ? "bg-rose-700 text-white shadow-xs"
                : "bg-rose-50 hover:bg-rose-100 text-rose-800"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>يحتاجون متابعة ({attentionCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilter("high");
              setLimit(INITIAL_LIMIT);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              filter === "high"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>المتميزون ({highCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setLimit(INITIAL_LIMIT);
            }}
            placeholder="بحث باسم الطالب..."
            className="w-full text-xs rounded-xl border border-slate-200 py-2 pr-9 pl-3 bg-slate-50/70 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm mb-1">لا يوجد طلاب يطابقون هذا التصنيف</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {searchQuery
              ? "لم يتم العثور على أي طالب بهذا الاسم، جرب كلمة بحث أخرى."
              : "جميع طلاب الحلقة في حالة طيبة بحمد الله."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedStudents.map((student) => (
              <StudentCard
                key={student.id || student.profile.userId}
                student={student}
              />
            ))}
          </div>

          {/* Load More & Counter Controls */}
          {hasMore ? (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 font-medium">
                يتم عرض <strong className="text-slate-900">{displayedStudents.length}</strong> من إجمالي <strong className="text-slate-900">{filteredStudents.length}</strong> طالباً في الحلقة
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLimit((prev) => prev + 6)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>عرض المزيد (+{Math.min(6, filteredStudents.length - limit)} طلاب)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLimit(filteredStudents.length)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all"
                >
                  عرض الكل
                </button>
              </div>
            </div>
          ) : filteredStudents.length > INITIAL_LIMIT ? (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setLimit(INITIAL_LIMIT)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <span>طي القائمة وعرض أول {INITIAL_LIMIT} طلاب فقط</span>
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
