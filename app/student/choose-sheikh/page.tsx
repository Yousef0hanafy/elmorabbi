import { Header } from "@/components/shared/Header";
import { StudentBottomNav } from "@/components/shared/RoleBottomNav";
import { requireRole } from "@/lib/auth";
import { dataService } from "@/lib/data-service";
import { ChooseSheikhDirectory } from "@/components/student/ChooseSheikhDirectory";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function ChooseSheikhPage() {
  const session = await requireRole("student");

  // Public directory fields only: sheikhs' emails and phones stay on the server
  const sheikhs = (await dataService.getAllSheikhs()).map((s) => ({
    id: s.id,
    name: s.name,
    title: s.title,
    bio: s.bio,
    halaqahName: s.halaqahName,
  }));
  const currentProfile = await dataService.getStudentProfile(session.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] pb-24 md:pb-12">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-6">
          <Link
            href="/student"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 mb-3"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى ورد اليوم</span>
          </Link>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            اختيار الشيخ المشرف والمربي
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-quran">
            اختر الشيخ الذي ترغب في متابعة وردك اليومي تحت إشرافه وتلقي نصائحه وتوجيهاته التربوية
          </p>
        </div>

        <ChooseSheikhDirectory
          sheikhs={sheikhs}
          currentSheikhId={currentProfile?.sheikhId}
        />
      </main>

      <StudentBottomNav studentId={session.id} />
    </div>
  );
}
