import { createSessionToken } from "../lib/auth.ts";

async function testSheikhPage() {
  const sheikhUser = {
    id: "sheikh-mahmoud",
    name: "الشيخ محمود عبد الحليم",
    email: "sheikh@elmorabbi.com",
    role: "sheikh",
  };

  const token = await createSessionToken(sheikhUser);

  const res = await fetch("http://localhost:3000/sheikh", {
    headers: {
      Cookie: `session=${token}`,
    },
  });

  console.log("Sheikh authenticated /sheikh status:", res.status);
  const html = await res.text();

  const hasHalaqah = html.includes("الشيخ محمود") || html.includes("حلقة");
  const hasSupervisorBox = html.includes("المشرف</span>");
  const hasBroadcastBtn = html.includes("إرسال توجيه عام لطلاب الحلقة");
  const hasInquiriesSection = html.includes("استفسارات وأسئلة الطلاب الواردة");

  console.log("Has Halaqah Name:", hasHalaqah);
  console.log("Has Unwanted Supervisor Box:", hasSupervisorBox);
  console.log("Has Broadcast Button:", hasBroadcastBtn);
  console.log("Has Inquiries Section:", hasInquiriesSection);
}

testSheikhPage().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
