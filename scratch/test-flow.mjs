import { dataService } from "../lib/data-service.ts";

async function runTest() {
  console.log("--- Starting Sheikh & Auth Verification ---");

  // 1. Check getUserByEmail
  const student = await dataService.getUserByEmail("ahmed@student.com");
  console.log("Student lookup:", student?.name, "Role:", student?.role);

  const sheikh = await dataService.getUserByEmail("sheikh@elmorabbi.com");
  console.log("Sheikh lookup:", sheikh?.name, "Role:", sheikh?.role, "Status:", sheikh?.status);

  // 2. Create a test pending sheikh
  const testSheikhEmail = `sheikh.test.${Date.now()}@elmorabbi.com`;
  const newSheikhUser = {
    id: `sheikh-${Date.now()}`,
    name: "الشيخ عبد الله القرني",
    email: testSheikhEmail,
    password: "password123",
    role: "sheikh",
    phone: "+966551234567",
    title: "مقرئ ومجاز في التجويد",
    halaqahName: "حلقة الفرقان",
    bio: "إجازة في حفص وشعبة",
  };

  console.log("Creating new pending sheikh...");
  await dataService.createUser(newSheikhUser);

  // Verify created user is pending
  const lookupNew = await dataService.getUserByEmail(testSheikhEmail);
  console.log("Lookup new sheikh status:", lookupNew?.status);

  // 3. Check pending list in dataService
  const pending = await dataService.getPendingSheikhs();
  console.log("Total pending sheikhs:", pending.length);
  const foundInPending = pending.some((p) => p.email === testSheikhEmail);
  console.log("Found in pending list:", foundInPending);

  // 4. Approve the sheikh
  if (lookupNew) {
    console.log("Approving sheikh...");
    await dataService.approveSheikh(lookupNew.id);
    const lookupAfterApproval = await dataService.getUserByEmail(testSheikhEmail);
    console.log("Status after approval:", lookupAfterApproval?.status);
  }

  console.log("--- Test Complete ---");
}

runTest().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
