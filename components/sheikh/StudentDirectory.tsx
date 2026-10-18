"use client";

import { useMemo, useState } from "react";
import { hasLoggedAnything, needsAttention } from "@/lib/scoring";
import { StudentRow, type StudentRowData } from "./StudentRow";
import { Users, AlertTriangle, Sparkles, Search, ChevronDown } from "lucide-react";

interface StudentDirectoryProps {
  students: StudentRowData[];
}

type Filter = "all" | "attention" | "high";

const PAGE_SIZE = 8;

// Needs follow-up first, then students who have not logged today, then by today's completion
function priority(s: StudentRowData): number {
  if (needsAttention(s)) return 0;
  if (!hasLoggedAnything(s.todayLog)) return 1;
  return 2;
}

export function StudentDirectory({ students }: StudentDirectoryProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const sorted = useMemo(
    () => [...students].sort((a, b) => priority(a) - priority(b) || b.completionRate - a.completionRate),
    [students]
  );

  const isHighPerformer = (s: StudentRowData) => s.completionRate >= 80;
  const attentionCount = students.filter(needsAttention).length;
  const highCount = students.filter(isHighPerformer).length;

  const query = searchQuery.trim().toLowerCase();
  const filtered = sorted.filter((s) => {
    if (query && !s.name.toLowerCase().includes(query)) return false;
    if (filter === "attention") return needsAttention(s);
    if (filter === "high") return isHighPerformer(s);
    return true;
  });
  const displayed = filtered.slice(0, limit);

  const filters: { key: Filter; label: string; icon: typeof Users; active: string; idle: string }[] = [
    { key: "all", label: `الكل (${students.length})`, icon: Users, active: "bg-slate-900 text-white", idle: "bg-slate-50 text-slate-600 hover:bg-slate-100" },
    { key: "attention", label: `يحتاجون متابعة (${attentionCount})`, icon: AlertTriangle, active: "bg-rose-700 text-white", idle: "bg-rose-50 text-rose-800 hover:bg-rose-100" },
    { key: "high", label: `المتميزون (${highCount})`, icon: Sparkles, active: "bg-emerald-700 text-white", idle: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="تصفية الطلاب">
          {filters.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => {
                  setFilter(f.key);
                  setLimit(PAGE_SIZE);
                }}
                className={`min-h-10 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${filter === f.key ? f.active : f.idle}`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {f.label}
              </button>
            );
          })}
        </div>

        <label className="relative w-full md:w-64">
          <span className="sr-only">بحث باسم الطالب</span>
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            placeholder="بحث باسم الطالب..."
            className="w-full min-h-10 text-sm rounded-xl border border-slate-200 pr-9 pl-3 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-sm text-slate-500">
          {students.length === 0
            ? "لم ينضم أي طالب لحلقتك بعد."
            : query
            ? "لم يتم العثور على طالب بهذا الاسم."
            : filter === "attention"
            ? "لا يوجد طلاب يحتاجون متابعة اليوم بحمد الله."
            : "لا يوجد طلاب في هذا التصنيف."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {displayed.map((student) => (
            <StudentRow key={student.id} student={student} />
          ))}
        </ul>
      )}

      {filtered.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
          className="w-full min-h-11 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
        >
          عرض المزيد ({filtered.length - limit} طالب متبقٍ)
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
