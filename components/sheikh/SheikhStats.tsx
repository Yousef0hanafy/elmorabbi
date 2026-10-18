import { Users, CheckCircle2, Flame, AlertCircle } from "lucide-react";

interface SheikhStatsProps {
  totalStudents: number;
  avgCompletion: number;
  fajrCommittedCount: number;
  needsAttentionCount: number;
}

export function SheikhStats({
  totalStudents,
  avgCompletion,
  fajrCommittedCount,
  needsAttentionCount,
}: SheikhStatsProps) {
  const stats = [
    {
      label: "طلاب الحلقة",
      value: `${totalStudents} طلاب`,
      subtext: "تحت إشرافك المباشر",
      icon: Users,
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      label: "متوسط إنجاز الورد",
      value: `${avgCompletion}%`,
      subtext: "إنجاز جماعي لليوم",
      icon: CheckCircle2,
      color: "bg-teal-100 text-teal-800",
    },
    {
      label: "المواظبون على الفجر",
      value: `${fajrCommittedCount} طلاب`,
      subtext: "في المسجد أو في وقتها",
      icon: Flame,
      color: "bg-amber-100 text-amber-800",
    },
    {
      label: "يحتاجون لمتابعة",
      value: `${needsAttentionCount} طلاب`,
      subtext: "فاتته صلاة أو قضى الفجر اليوم",
      icon: AlertCircle,
      color: "bg-rose-100 text-rose-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">
                {stat.label}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 block leading-tight">
                {stat.value}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {stat.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
