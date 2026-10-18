import bcrypt from "bcryptjs";
import { getDb, schema } from "./index";
import { addDays, todayDateString } from "../lib/dates";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const db = getDb();

// Demo accounts share one password; override it with SEED_PASSWORD (min 8 chars)
const seedPassword = process.env.SEED_PASSWORD || "password123";

async function seed() {
  console.log("🌱 Seeding database...");

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

  // Insert Sheikh Profile (approved, so students can join)
  const sheikhProfile = {
    id: "sp-sheikh-mahmoud",
    userId: "sheikh-mahmoud",
    title: "مقرئ القراءات العشر ومجاز في الحديث النبوي الشريف",
    bio: "إمام ومدرس للقرآن الكريم والعلوم الشرعية، أهدف لمساعدة الطلاب على الاستقامة وبناء الورد اليومي ومحاسبة النفس وفق منهج تربوي أصيل.",
    isAcceptingStudents: true,
    halaqahName: "حلقة الهدى والنور لتزكية النفوس",
    status: "active" as const,
  };
  await db
    .insert(schema.sheikhProfiles)
    .values(sheikhProfile)
    .onConflictDoUpdate({ target: schema.sheikhProfiles.id, set: sheikhProfile });

  // Insert Student Profiles
  const studentProfiles = [
    {
      id: "sp-ahmed",
      userId: "student-ahmed",
      sheikhId: "sheikh-mahmoud",
      level: "طالب مواظب (المستوى الثاني)",
      status: "active" as const,
    },
    {
      id: "sp-omar",
      userId: "student-omar",
      sheikhId: "sheikh-mahmoud",
      level: "مبتدئ يحتاج متابعة",
      status: "active" as const,
    },
    {
      id: "sp-youssef",
      userId: "student-youssef",
      sheikhId: "sheikh-mahmoud",
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

  // Today's Date (Egypt calendar day, same as the app)
  const today = todayDateString();

  // Insert Daily Logs
  const logs: (typeof schema.dailyLogs.$inferInsert)[] = [
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

  // Past days so streaks and the weekly chart show real data:
  // each entry is [studentId, consecutive full-prayer days before today, total history days]
  const historyPlan: [string, number, number][] = [
    ["student-ahmed", 13, 20],
    ["student-omar", 2, 10],
    ["student-youssef", 27, 30],
  ];
  for (const [studentId, streakBeforeToday, totalDays] of historyPlan) {
    for (let i = 1; i <= totalDays; i++) {
      const date = addDays(today, -i);
      const prayedAll = i <= streakBeforeToday;
      logs.push({
        id: `log-${studentId}-${date}`,
        studentId,
        date,
        fajr: prayedAll ? (i % 3 === 0 ? "ontime" : "congregation") : "missed",
        dhuhr: "congregation",
        asr: i % 4 === 0 ? "late" : "ontime",
        maghrib: "congregation",
        isha: prayedAll ? "ontime" : "late",
        quranRead: i % 5 !== 0,
        quranPages: i % 5 !== 0 ? 4 + (i % 4) * 2 : 0,
        adhkarMorning: true,
        adhkarEvening: i % 2 === 0,
        fasting: i % 7 === 3 ? "voluntary" : "none",
        notes: "",
      });
    }
  }

  for (const log of logs) {
    await db
      .insert(schema.dailyLogs)
      .values(log)
      .onConflictDoUpdate({ target: schema.dailyLogs.id, set: log });
  }

  // Insert Feedback
  const feedbackItems: (typeof schema.feedbackMessages.$inferInsert)[] = [
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

  // A student question (kind "question") so the sheikh's inquiries feed has demo data
  feedbackItems.push({
    id: "q-1",
    sheikhId: "sheikh-mahmoud",
    studentId: "student-ahmed",
    content: "فضيلة الشيخ، كيف أثبت ورد الحفظ والمراجعة مع كثرة الانشغال بالعمل والدراسة؟ جزاكم الله خيراً.",
    type: "advice" as const,
    isRead: false,
    kind: "question" as const,
    category: "تثبيت ورد القرآن",
  });

  for (const fb of feedbackItems) {
    await db
      .insert(schema.feedbackMessages)
      .values(fb)
      .onConflictDoUpdate({ target: schema.feedbackMessages.id, set: fb });
  }

  console.log("✅ Database seeded successfully!");
  console.log(`🔑 All demo accounts use the password: ${seedPassword}`);
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  });
