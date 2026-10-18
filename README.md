# منصة المربي

منصة تربوية تربط الطالب بشيخه: الطالب يسجّل ورده اليومي (الصلوات الخمس، القرآن، أذكار الصباح والمساء، الصيام، والمحاسبة اليومية)، والشيخ يتابع طلاب حلقته ويرسل لهم التوجيهات، والإدارة تعتمد المشايخ وتدير المنصة.

## التقنيات

- **Next.js 16** (App Router + Server Actions) و **React 19** و **TypeScript**
- **Tailwind CSS v4**، وواجهة عربية بالكامل (RTL)
- **Postgres** عبر **Drizzle ORM**: Neon في الإنتاج، وPostgres محلي للتطوير
- الجلسات: كوكي موقّع بـ **jose** (HS256)، والباسوردات مشفّرة بـ **bcrypt**

## التشغيل محلياً

```bash
npm install
cp .env.example .env.local   # واملأ القيم
npm run db:push              # إنشاء/تحديث الجداول
npm run db:seed              # بيانات تجريبية
npm run dev
```

> `db:push` يقرأ `DATABASE_URL` من بيئة التشغيل، فلو مش متعرّف عندك: `DATABASE_URL=... npm run db:push`.

### متغيرات البيئة

| المتغير | مطلوب؟ | الوصف |
|---|---|---|
| `DATABASE_URL` | نعم | رابط Postgres. لو الـ host هو `localhost` أو `127.0.0.1` بيستخدم `pg`، وغير كده Neon عن طريق HTTP |
| `SESSION_SECRET` | نعم في الإنتاج | مفتاح توقيع الجلسات (32 حرف على الأقل): `openssl rand -base64 48` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | اختياري | حساب أدمن من البيئة. ولو مش موجود، الدخول بيبقى لحسابات الأدمن المتخزنة في القاعدة بس |
| `SEED_PASSWORD` | اختياري | باسورد كل الحسابات التجريبية (الافتراضي `password123`) |

### الحسابات التجريبية (بعد `db:seed`)

| الدور | البريد |
|---|---|
| شيخ | `sheikh@elmorabbi.com` |
| طلاب | `ahmed@student.com`، `omar@student.com`، `youssef@student.com` |
| أدمن | `admin@elmorabbi.com` (من `/admin`) |

## السكربتات

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | التطوير |
| `npm run build` / `npm start` | بناء وتشغيل الإنتاج |
| `npm run lint` | ESLint |
| `npm run typecheck` | فحص أنواع TypeScript |
| `npm test` | اختبارات الوحدة (`tests/unit`): التواريخ، الـ streak، التنبيهات، التحقق من المدخلات |
| `npm run test:e2e` | اختبارات Playwright (`tests/e2e`) على build حقيقي وقاعدة Postgres (بتعمل seed الأول) |
| `npm run db:push` | مزامنة `db/schema.ts` مع القاعدة |
| `npm run db:seed` | إدخال بيانات تجريبية |

## الاختبارات و CI

- **وحدة:** `npm test`، ومش محتاجة قاعدة بيانات.
- **e2e:** محتاجة قاعدة **تجريبية** (الاختبارات بتعمل `db:seed` عليها) و`SESSION_SECRET`:
  ```bash
  export DATABASE_URL=postgresql://postgres@localhost:5432/elmorabbi_test SESSION_SECRET=$(openssl rand -base64 48)
  npx drizzle-kit push --force && npm run build && npm run test:e2e
  ```
- **GitHub Actions** (`.github/workflows/ci.yml`): كل push على `main` وكل PR بيشغّل lint + typecheck + الوحدة + build، وكمان e2e على Postgres 16.

## ملاحظات النشر

- **حماية الدخول من التخمين:** 10 محاولات فاشلة خلال 15 دقيقة لكل IP ولكل بريد، و20 تسجيل في الساعة لكل IP (`lib/rate-limit.ts`). التخزين في ذاكرة السيرفر، يعني بيحمي نسخة واحدة بس. على Vercel أو أي استضافة بأكتر من نسخة، بدّل التخزين بـ Redis/Upstash بنفس الواجهة. وعنوان العميل بيتقري من `x-forwarded-for`، فلازم السيرفر يبقى ورا proxy موثوق بيظبط الهيدر ده.
- **PWA:** `app/manifest.ts` + أيقونات في `public/`. التطبيق بيتثبّت على الموبايل، ولما يتفتح من الأيقونة المسجّل بيروح للوحته على طول.

## هيكل المشروع

```
app/                 الصفحات (student / sheikh / admin / login / register) + error.tsx
components/
  ui/                مكونات مشتركة (Dialog, ErrorAlert)
  student/ sheikh/ admin/ auth/ shared/
lib/
  auth.ts            الجلسة + requireRole() (المصدر الوحيد للصلاحيات)
  actions/           Server Actions (فيها التحقق من الصلاحية والمدخلات)
  data-service.ts    واجهة الوصول للبيانات (بتجمع lib/data/*)
  data/              استعلامات مقسّمة: users, students, logs, messages
  scoring.ts         حساب الأعمال والـ streak و"يحتاج متابعة"
  dates.ts           التواريخ بتوقيت مصر (Africa/Cairo)
  labels.ts          تسميات وألوان الصلوات والصيام
  validation.ts      قيم مسموحة وحدود المدخلات
  rate-limit.ts      حدود محاولات الدخول والتسجيل
tests/unit/          اختبارات الوحدة (node:test + tsx)
tests/e2e/           اختبارات Playwright
db/                  schema + seed + الاتصال
docs/                وثائق الاكتشاف والقرارات
```

## قواعد مهمة

- **كل Server Action وكل صفحة محمية** بتبدأ بالتحقق من الجلسة والدور. والجلسة بتتراجع من القاعدة مع كل طلب، فالحساب المحذوف أو الشيخ المرفوض بيخرج فوراً.
- **مفيش بيانات وهمية في مسار التشغيل**: لو القاعدة مش متاحة، المستخدم بيشوف صفحة خطأ.
- **اليوم = يوم القاهرة**: استخدم `todayDateString()` من `lib/dates.ts`، وما تستخدمش `toISOString()`.
- **الـ streak**: الأيام المتتالية اللي اتصلّت فيها الصلوات الخمس (المتأخرة بتتحسب، والفائتة لأ).

حالة المشروع وخطة التحسين في [`docs/discovery/00-current-state-audit.md`](docs/discovery/00-current-state-audit.md).
