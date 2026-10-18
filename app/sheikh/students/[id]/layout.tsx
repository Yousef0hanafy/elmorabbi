import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { dataService } from "@/lib/data-service";

// Ownership check before streaming starts so foreign students return a real 404.
// The page repeats the check (layouts are not re-run on every client navigation).
export default async function SheikhStudentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireRole("sheikh");
  if (!(await dataService.isStudentOfSheikh(id, session.id))) {
    notFound();
  }
  return children;
}
