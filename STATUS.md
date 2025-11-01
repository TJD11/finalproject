# 🚀 حالة تشغيل التطبيق

## ✅ الخادم الخلفي (Backend) - قيد التشغيل

**المنفذ**: http://localhost:5000
**الحالة**: ✅ يعمل بشكل صحيح

### الخدمات المتاحة:

#### 1️⃣ 🕌 خدمة أوقات الصلاة
- **Endpoint**: `GET /api/v1/prayer-times`
- **المعاملات**:
  - `lat`: خط العرض (مثال: 30.0444)
  - `lng`: خط الطول (مثال: 31.2357)
  - `method`: طريقة الحساب (MWL, ISNA, Egyptian, UmmAlQura, Karachi)
  - `madhab`: المذهب الفقهي (hanafi, maliki, shafi, hanbali)

**مثال**:
```bash
curl "http://localhost:5000/api/v1/prayer-times?lat=30.0444&lng=31.2357&method=MWL&madhab=shafi"
```

**طرق الحساب المدعومة**:
- ✅ Muslim World League (MWL) - عالمي
- ✅ Egyptian General Authority - مصر
- ✅ University of Islamic Sciences, Karachi - جنوب آسيا
- ✅ Umm Al-Qura, Makkah - السعودية
- ✅ ISNA (North America) - أمريكا الشمالية

**المذاهب الفقهية**:
- ✅ Hanafi - الحنفي
- ✅ Maliki - المالكي
- ✅ Shafi'i - الشافعي (افتراضي)
- ✅ Hanbali - الحنبلي

---

#### 2️⃣ 🧭 خدمة اتجاه القبلة
- **Endpoint**: `GET /api/v1/qibla`
- **المعاملات**:
  - `lat`: خط العرض
  - `lng`: خط الطول

**مثال** (من القاهرة):
```bash
curl "http://localhost:5000/api/v1/qibla?lat=30.0444&lng=31.2357"
```

**الاستجابة تتضمن**:
- اتجاه القبلة (بالدرجات من 0-360)
- المسافة إلى الكعبة (بالكيلومترات)
- دقة الموقع (بالأمتار)
- معلومات الموثوقية

---

#### 3️⃣ 📖 خدمة القرآن
- **Endpoints**:
  - `GET /api/v1/quran/surahs` - قائمة جميع السور
  - `GET /api/v1/quran/surah/{number}` - سورة معينة
  - `GET /api/v1/quran/search` - البحث في القرآن
  - `GET /api/v1/quran/recitations` - قائمة المقرئين

---

#### 4️⃣ 📚 خدمة الأحاديث
- **Endpoints**:
  - `GET /api/v1/hadith/collections` - المجموعات (البخاري، مسلم)
  - `GET /api/v1/hadith/collection/{id}/books` - كتب المجموعة
  - `GET /api/v1/hadith/collection/{id}/book/{bookId}` - أحاديث الكتاب
  - `GET /api/v1/hadith/search` - البحث في الأحاديث

**المجموعات**:
- ✅ Sahih Al-Bukhari (7,563 حديث)
- ✅ Sahih Muslim (7,190 حديث)

---

#### 5️⃣ 🕯️ خدمة الأذكار
- **Endpoints**:
  - `GET /api/v1/adhkar/categories` - فئات الأذكار
  - `GET /api/v1/adhkar/category/{id}` - أذكار فئة معينة
  - `POST /api/v1/adhkar/counter/{id}` - تسجيل العداد
  - `GET /api/v1/adhkar/progress` - متابعة التقدم

**الفئات**:
- ✅ أذكار الصباح
- ✅ أذكار المساء
- ✅ أذكار النوم
- ✅ أذكار الاستيقاظ
- ✅ أذكار السفر
- ✅ أذكار الصلاة
- ✅ أذكار بعد الوضوء

---

#### 6️⃣ 🔐 خدمة المستخدم
- **Endpoints**:
  - `POST /api/v1/auth/register` - تسجيل حساب جديد
  - `POST /api/v1/auth/login` - تسجيل الدخول
  - `GET /api/v1/user/settings` - إعدادات المستخدم
  - `POST /api/v1/user/settings` - تحديث الإعدادات
  - `POST /api/v1/user/bookmarks` - إدارة الإشارات المرجعية

---

#### 7️⃣ 🏥 خدمة الصحة
- **Endpoint**: `GET /api/v1/health`
- **الوظيفة**: التحقق من حالة الخادم

---

## 📱 التطبيق الأمامي (Frontend)

**الحالة**: ✅ جاهز للتشغيل

### المتطلبات:
- Node.js 16+
- npm أو yarn
- Expo CLI

### خطوات التشغيل:
```bash
cd finalp/frontend
npm install
npm start
```

### الخيارات:
- اضغط `a` لـ Android
- اضغط `i` لـ iOS
- اضغط `w` لـ Web
- اضغط `q` للخروج

---

## 🌍 الشاشات المتاحة

1. ✅ **لوحة التحكم** (Dashboard) - تحديث الصلاة القادمة
2. ✅ **القبلة** (Qibla) - البوصلة التفاعلية
3. ✅ **أوقات الصلاة** (Prayer Times) - قائمة تفصيلية
4. ✅ **القرآن** (Quran) - قراءة وبحث
5. ✅ **الحديث** (Hadith) - مكتبة الأحاديث
6. ✅ **الأذكار** (Adhkar) - العادات والتذكيرات
7. ✅ **الإعدادات** (Settings) - التخصيص والتفضيلات

---

## 🌐 اللغات المدعومة

- 🇸🇦 **العربية** (Arabic)
- 🇬🇧 **الإنجليزية** (English)
- 🇫🇷 **الفرنسية** (French)
- 🇮🇩 **الإندونيسية** (Indonesian)

---

## 📊 إحصائيات البيانات

- **السور**: 114 سورة
- **الآيات**: ~6,236 آية
- **أحاديث البخاري**: 7,563 حديث
- **أحاديث مسلم**: 7,190 حديث
- **فئات الأذكار**: 7 فئات

---

## 🔗 روابط مهمة

- **API Documentation**: `/docs/API.md`
- **Architecture**: `/docs/ARCHITECTURE.md`
- **Setup Guide**: `/docs/SETUP.md`
- **Project README**: `/README.md`

---

## ✨ الميزات المتاحة حالياً

✅ حساب أوقات الصلاة بدقة
✅ حساب اتجاه القبلة
✅ دعم لغات متعددة (4 لغات)
✅ دعم مذاهب فقهية متعددة (4 مذاهب)
✅ دعم طرق حساب مختلفة (5 طرق)
✅ واجهة مستخدم بديهية
✅ إدارة الإعدادات والتفضيلات
✅ نظام التخزين المحلي

---

## 🚀 الخطوات التالية

📝 تطوير قواعد البيانات (PostgreSQL)
📱 تطبيق الشاشات المتبقية
🔔 نظام التنبيهات
📥 تخزين البيانات بدون اتصال
🧪 اختبارات شاملة
🚀 النشر على الخوادم

---

**آخر تحديث**: November 1, 2025
**الإصدار**: 1.0.0 (Phase 1 - MVP)
**الحالة**: ✅ قيد التشغيل بنجاح
