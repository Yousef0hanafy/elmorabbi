import { BottomNav } from "./BottomNav";
import { dataService } from "@/lib/data-service";

// Server wrapper that adds live counters to the mobile navigation
export async function StudentBottomNav({ studentId }: { studentId: string }) {
  const unread = await dataService.countUnreadForStudent(studentId);
  return <BottomNav role="student" badges={{ "/student/sheikh": unread }} />;
}

export async function SheikhBottomNav({ sheikhId }: { sheikhId: string }) {
  const unanswered = await dataService.countUnansweredForSheikh(sheikhId);
  return <BottomNav role="sheikh" badges={{ "/sheikh#inquiries": unanswered }} />;
}
