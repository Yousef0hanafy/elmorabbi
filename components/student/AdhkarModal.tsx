"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { X, Check, RotateCcw, Sparkles } from "lucide-react";

export interface DhikrItem {
  id: string;
  text: string;
  source: string;
  targetCount: number;
}

const morningAdhkarList: DhikrItem[] = [
  {
    id: "m1",
    text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    source: "آية الكرسي - من قرأها حين يصبح أجير من الجن حتى يمسي",
    targetCount: 1,
  },
  {
    id: "m2",
    text: "أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ، لا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا اليَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا اليَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الكَسَلِ وَسُوءِ الكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي القَبْرِ.",
    source: "صحيح مسلم",
    targetCount: 1,
  },
  {
    id: "m3",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.",
    source: "سيد الاستغفار - من قالها موقناً بها فمات من يومه دخل الجنة",
    targetCount: 1,
  },
  {
    id: "m4",
    text: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ.",
    source: "ثلاث مرات - لم يضره شيء",
    targetCount: 3,
  },
  {
    id: "m5",
    text: "رَضِيتُ بِاللَّهِ رَبَّاً، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ ﷺ نَبِيّاً.",
    source: "ثلاث مرات - كان حقاً على الله أن يرضيه يوم القيامة",
    targetCount: 3,
  },
  {
    id: "m6",
    text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
    source: "حسن - رواه الحاكم والنسائي",
    targetCount: 1,
  },
  {
    id: "m7",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
    source: "مائة مرة - حُطت خطاياه وإن كانت مثل زبد البحر",
    targetCount: 100,
  },
];

const eveningAdhkarList: DhikrItem[] = [
  {
    id: "e1",
    text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    source: "آية الكرسي - من قرأها حين يمسي أجير من الجن حتى يصبح",
    targetCount: 1,
  },
  {
    id: "e2",
    text: "أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ، لا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الكَسَلِ وَسُوءِ الكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي القَبْرِ.",
    source: "صحيح مسلم",
    targetCount: 1,
  },
  {
    id: "e3",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.",
    source: "سيد الاستغفار - من قالها موقناً بها فمات من ليلته دخل الجنة",
    targetCount: 1,
  },
  {
    id: "e4",
    text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
    source: "ثلاث مرات - لم يضره شيء في تلك الليلة",
    targetCount: 3,
  },
  {
    id: "e5",
    text: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ.",
    source: "ثلاث مرات - لم يضره شيء",
    targetCount: 3,
  },
  {
    id: "e6",
    text: "رَضِيتُ بِاللَّهِ رَبَّاً، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ ﷺ نَبِيّاً.",
    source: "ثلاث مرات - كان حقاً على الله أن يرضيه يوم القيامة",
    targetCount: 3,
  },
  {
    id: "e7",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
    source: "مائة مرة - حُطت خطاياه وإن كانت مثل زبد البحر",
    targetCount: 100,
  },
];

interface AdhkarModalProps {
  type: "morning" | "evening";
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function AdhkarModal({ type, isOpen, onClose, onComplete }: AdhkarModalProps) {
  const items = type === "morning" ? morningAdhkarList : eveningAdhkarList;
  const title = type === "morning" ? "أذكار الصباح المباركة" : "أذكار المساء المباركة";
  const [counts, setCounts] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const handleIncrement = (id: string, target: number) => {
    const current = counts[id] || 0;
    if (current < target) {
      setCounts((prev) => ({ ...prev, [id]: current + 1 }));
    }
  };

  const handleFinish = () => {
    onComplete();
    onClose();
  };

  return (
    <Dialog onClose={onClose} label="قراءة الأذكار" className="max-w-2xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className={`p-4 sm:p-5 flex items-center justify-between text-white ${
        type === "morning"
          ? "bg-gradient-to-r from-amber-600 to-amber-700"
          : "bg-gradient-to-r from-indigo-700 to-slate-900"
      }`}>
        <div>
          <span className="text-xs font-semibold text-white/80 block">حصن المسلم</span>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <button
          aria-label="إغلاق"
          onClick={onClose}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Adhkar Content Scrollable List */}
      <div className="p-4 sm:p-6 overflow-y-auto space-y-4 divide-y divide-slate-100 flex-1">
        {items.map((item, index) => {
          const currentCount = counts[item.id] || 0;
          const completed = currentCount >= item.targetCount;

          return (
            <div
              key={item.id}
              className={`pt-4 first:pt-0 flex flex-col gap-3 rounded-2xl p-4 transition-all ${
                completed ? "bg-emerald-50/60 border border-emerald-200/80" : "bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  الذكر رقم {index + 1}
                </span>
                <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  التكرار: {item.targetCount}
                </span>
              </div>

              <p className="text-slate-900 text-sm sm:text-base font-quran leading-loose tracking-wide text-justify">
                {item.text}
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 italic">
                  {item.source}
                </span>

                {/* Counter button */}
                <button
                  onClick={() => handleIncrement(item.id, item.targetCount)}
                  disabled={completed}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                    completed
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                  }`}
                >
                  {completed ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>اكتمل</span>
                    </>
                  ) : (
                    <>
                      <span>اضغط للتسبيح</span>
                      <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[11px]">
                        {currentCount} / {item.targetCount}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <button
          onClick={() => setCounts({})}
          className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة العداد</span>
        </button>

        <button
          onClick={handleFinish}
          className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>تسجيل إتمام الأذكار وحفظها</span>
        </button>
      </div>
    </Dialog>
  );
}
