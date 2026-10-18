import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

// Demo accounts share one password; override it with SEED_PASSWORD (min 8 chars)
const seedPassword = process.env.SEED_PASSWORD || "password123";

async function seed() {
  console.log("🌱 Seeding Neon Postgres database...");

  const passwordHash = await bcrypt.hash(seedPassword, 10);

  // Insert Users
  const usersToInsert = [
    {
      id: "sheikh-mahmoud",
      name: "الشيخ محمود عبد الحليم",
      email: "sheikh@elmorabbi.com",
      password: passwordHash,
      role: "sheikh" as const,
      avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
      phone: "+20110 123 4567",
    },
    {
      id: "student-ahmed",
      name: "أحمد بن عبد الرحمن",
      email: "ahmed@student.com",
      password: passwordHash,
      role: "student" as const,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      phone: "+20115 987 6543",
    },
    {
      id: "student-omar",
      name: "عمر الفاروق الدوسري",
      email: "omar@student.com",
      password: passwordHash,
      role: "student" as const,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      phone: "+20114 321 0987",
    },
    {
      id: "student-youssef",
      name: "يوسف بن خالد السعيد",
      email: "youssef@student.com",
      password: passwordHash,
      role: "student" as const,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      phone: "+20116 456 7890",
    },
    {
      id: "admin-root",
      name: "المشرف العام",
      email: "admin@elmorabbi.com",
      password: passwordHash,
      role: "admin" as const,
    },
  ];

  for (const user of usersToInsert) {
    await db
      .insert(schema.users)
      .values(user)
      .onConflictDoUpdate({ target: schema.users.id, set: user });
  }

  // Insert Sheikh Profile
  await db
    .insert(schema.sheikhProfiles)
    .values({
      id: "sp-sheikh-mahmoud",
      userId: "sheikh-mahmoud",
      title: "مقرئ القراءات العشر ومجاز في الحديث النبوي الشريف",
      bio: "إمام ومدرس للقرآن الكريم والعلوم الشرعية، أهدف لمساعدة الطلاب على الاستقامة وبناء الورد اليومي ومحاسبة النفس وفق منهج تربوي أصيل.",
      isAcceptingStudents: true,
      halaqahName: "حلقة الهدى والنور لتزكية النفوس",
    })
    .onConflictDoNothing();

  // Insert Student Profiles
  const studentProfiles = [
    {
      id: "sp-ahmed",
      userId: "student-ahmed",
      sheikhId: "sheikh-mahmoud",
      streakDays: 14,
      level: "طالب مواظب (المستوى الثاني)",
      status: "active" as const,
    },
    {
      id: "sp-omar",
      userId: "student-omar",
      sheikhId: "sheikh-mahmoud",
      streakDays: 3,
      level: "مبتدئ يحتاج متابعة",
      status: "active" as const,
    },
    {
      id: "sp-youssef",
      userId: "student-youssef",
      sheikhId: "sheikh-mahmoud",
      streakDays: 28,
      level: "طالب متميز (المستوى المتقدم)",
      status: "active" as const,
    },
  ];

  for (const sp of studentProfiles) {
    await db
      .insert(schema.studentProfiles)
      .values(sp)
      .onConflictDoUpdate({ target: schema.studentProfiles.id, set: sp });
  }

  // Today's Date
  const today = new Date().toISOString().split("T")[0];

  // Insert Daily Logs
  const logs = [
    {
      id: `log-ahmed-${today}`,
      studentId: "student-ahmed",
      date: today,
      fajr: "congregation" as const,
      dhuhr: "congregation" as const,
      asr: "ontime" as const,
      maghrib: "congregation" as const,
      isha: "ontime" as const,
      quranRead: true,
      quranPages: 10,
      adhkarMorning: true,
      adhkarEvening: true,
      fasting: "voluntary" as const,
      notes: "الحمد لله استيقظت مبكراً ووفقت لصلاة الفجر في جماعة المسجد وقراءة جزء كامل.",
    },
    {
      id: `log-omar-${today}`,
      studentId: "student-omar",
      date: today,
      fajr: "late" as const,
      dhuhr: "ontime" as const,
      asr: "ontime" as const,
      maghrib: "missed" as const,
      isha: "missed" as const,
      quranRead: false,
      quranPages: 0,
      adhkarMorning: true,
      adhkarEvening: false,
      fasting: "none" as const,
      notes: "انشغلت بالجامعة اليوم وفاتتني صلاة المغرب في وقتها.",
    },
    {
      id: `log-youssef-${today}`,
      studentId: "student-youssef",
      date: today,
      fajr: "congregation" as const,
      dhuhr: "congregation" as const,
      asr: "congregation" as const,
      maghrib: "congregation" as const,
      isha: "congregation" as const,
      quranRead: true,
      quranPages: 20,
      adhkarMorning: true,
      adhkarEvening: true,
      fasting: "none" as const,
      notes: "أتممت حفظ سورة يس بفضل الله وبانتظار التسميع.",
    },
  ];

  for (const log of logs) {
    await db
      .insert(schema.dailyLogs)
      .values(log)
      .onConflictDoUpdate({ target: schema.dailyLogs.id, set: log });
  }

  // Insert Feedback
  const feedbackItems = [
    {
      id: "fb-1",
      sheikhId: "sheikh-mahmoud",
      studentId: "student-ahmed",
      content: "ما شاء الله يا بني، مواظبتك على صلاة الفجر في جماعة لليوم الرابع عشر تثلج الصدر. حافظ على ورد تدبر القرآن ولا تعجل في القراءة.",
      type: "praise" as const,
      isRead: false,
    },
    {
      id: "fb-2",
      sheikhId: "sheikh-mahmoud",
      studentId: "student-omar",
      content: "لاحظت تأخرك في صلاة الفجر أمس واليوم، النوم مبكراً هو المفتاح يا بني، والاستعانة بالمنبه والصحبة الصالحة. لا تتردد في الحديث معي إن كان هناك عائق.",
      type: "advice" as const,
      isRead: false,
    },
  ];

  for (const fb of feedbackItems) {
    await db
      .insert(schema.feedbackMessages)
      .values(fb)
      .onConflictDoUpdate({ target: schema.feedbackMessages.id, set: fb });
  }

  console.log("✅ Neon Postgres seeded successfully!");
  console.log(`🔑 All demo accounts use the password: ${seedPassword}`);
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  });
