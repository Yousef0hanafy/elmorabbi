"use client";

import { useState, useTransition } from "react";
import { UserRecord } from "@/lib/data-service";
import { chooseSheikhAction } from "@/lib/actions/sheikh-actions";
import { useRouter } from "next/navigation";
import { UserCheck, Check, Search, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface ChooseSheikhDirectoryProps {
  sheikhs: Pick<UserRecord, "id" | "name" | "title" | "bio" | "halaqahName">[];
  currentSheikhId?: string | null;
}

export function ChooseSheikhDirectory({
  sheikhs,
  currentSheikhId,
}: ChooseSheikhDirectoryProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const INITIAL_LIMIT = 4;
  const [limit, setLimit] = useState(INITIAL_LIMIT);

  const filteredSheikhs = sheikhs.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.title && s.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.halaqahName && s.halaqahName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.bio && s.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const visibleSheikhs = filteredSheikhs.slice(0, limit);

  const handleSelectSheikh = (sheikhId: string) => {
    setSelectedId(sheikhId);
    startTransition(async () => {
      await chooseSheikhAction(sheikhId);
      router.push("/student");
      router.refresh();
    });
  };

  if (sheikhs.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
        <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">لا يوجد مشايخ متاحون حالياً</h3>
        <p className="text-xs text-slate-500">سيتم تفعيل واعتماد حلقات المشايخ قريباً بإذن الله.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {sheikhs.length > 2 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث باسم الشيخ، اللقب، أو اسم الحلقة..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setLimit(INITIAL_LIMIT);
            }}
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-2xs"
          />
        </div>
      )}

      {/* Sheikh Cards Grid */}
      {filteredSheikhs.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-500">لا يوجد مشايخ يطابقون بحثك "{searchTerm}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {visibleSheikhs.map((sheikh) => {
            const isCurrent = currentSheikhId === sheikh.id;
            const isChoosingThis = isPending && selectedId === sheikh.id;

            return (
              <div
                key={sheikh.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : "border-slate-200/90 shadow-sm hover:border-emerald-200 hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                        {sheikh.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                          {sheikh.name}
                        </h3>
                        <span className="text-xs text-amber-700 font-semibold block">
                          {sheikh.title || "مربٍ ومعلم قرآن"}
                        </span>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        <span>شيخك الحالي</span>
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/50 mb-4 space-y-1">
                    <span className="text-xs font-bold text-amber-900 block">
                      حلقة: {sheikh.halaqahName || "حلقة المربي"}
                    </span>
                    <p className="text-xs text-slate-600 font-quran leading-relaxed line-clamp-3">
                      {sheikh.bio || "إشراف ومتابعة تربوية على الأوراد اليومية والمواظبة على العبادات."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isCurrent || isPending}
                  onClick={() => handleSelectSheikh(sheikh.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {isChoosingThis
                      ? "جاري الانضمام..."
                      : isCurrent
                      ? "أنت منضم لهذه الحلقة بالفعل"
                      : "طلب الانضمام والمتابعة مع الشيخ"}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Progressive Disclosure Controls */}
      {filteredSheikhs.length > limit ? (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setLimit((prev) => prev + 4)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ChevronDown className="w-4 h-4 text-emerald-700" />
            <span>عرض المزيد من المشايخ (+{filteredSheikhs.length - limit} متبقي)</span>
          </button>
          <button
            type="button"
            onClick={() => setLimit(filteredSheikhs.length)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            عرض الكل ({filteredSheikhs.length})
          </button>
        </div>
      ) : filteredSheikhs.length > INITIAL_LIMIT ? (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setLimit(INITIAL_LIMIT)}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 bg-white px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <span>طي القائمة وعرض أول {INITIAL_LIMIT} مشايخ فقط</span>
            <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
