# دليل التثبيت الشامل 🛠️

## المتطلبات الأساسية

### للجميع
- **Git**: [تحميل](https://git-scm.com/downloads)
- **Node.js 16+**: [تحميل](https://nodejs.org/)
- **npm**: يأتي مع Node.js

### للتطوير (Backend)
- **PostgreSQL**: [تحميل](https://www.postgresql.org/download/)
- **Redis**: [تحميل](https://redis.io/download)
- أي محرر نصوص (VS Code موصى به)

### للتطوير (Frontend)
- **Expo CLI**: `npm install -g expo-cli`
- **Android Studio** أو **Xcode** (اختياري)

---

## التثبيت المفصل

### Windows 🪟

#### 1. تثبيت Git
```bash
# عبر Chocolatey
choco install git

# أو عبر المثبت المباشر
# https://git-scm.com/downloads
```

#### 2. تثبيت Node.js
```bash
# عبر Chocolatey
choco install nodejs

# تحقق من التثبيت
node --version
npm --version
```

#### 3. استنساخ المشروع
```bash
git clone https://github.com/YOUR_USERNAME/islamic-companion.git
cd islamic-companion
```

#### 4. تثبيت المكتبات
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### macOS 🍎

#### 1. تثبيت Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. تثبيت الأدوات المطلوبة
```bash
brew install git node postgresql redis
```

#### 3. استنساخ المشروع
```bash
git clone https://github.com/YOUR_USERNAME/islamic-companion.git
cd islamic-companion
```

#### 4. تثبيت المكتبات
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Linux 🐧 (Ubuntu/Debian)

#### 1. تحديث النظام
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. تثبيت الأدوات المطلوبة
```bash
sudo apt install -y git nodejs npm postgresql redis-server
```

#### 3. استنساخ المشروع
```bash
git clone https://github.com/YOUR_USERNAME/islamic-companion.git
cd islamic-companion
```

#### 4. تثبيت المكتبات
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## التشغيل الأول

### Backend (في نافذة Terminal)
```bash
cd backend

# إنشاء ملف الإعدادات
cp .env.example .env

# تعديل البيانات (اختياري)
# nano .env

# تشغيل الخادم
npm run dev
```

### Frontend (في نافذة Terminal جديدة)
```bash
cd frontend

# تثبيت Expo CLI عالمياً
npm install -g expo-cli

# تشغيل التطبيق
npm start

# اختر الخيار:
# a = Android
# i = iOS
# w = Web
```

---

## حل المشاكل الشائعة

### 1. خطأ "Module not found"
```bash
# احذف مجلد node_modules
rm -rf node_modules package-lock.json

# ثبت من جديد
npm install
```

### 2. خطأ "Port already in use"
```bash
# غير المنفذ في ملف .env
PORT=5001

# أو أغلق البرنامج الذي يستخدم المنفذ
# على Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# على Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### 3. مشاكل PostgreSQL
```bash
# تحقق من أن PostgreSQL يعمل
sudo systemctl status postgresql

# أو على Mac
brew services list

# إنشاء قاعدة البيانات
createdb islamic_companion
```

### 4. مشاكل Expo
```bash
# حدّث Expo
npm install -g expo-cli@latest

# شغل مع حذف الـ cache
npm start -c

# أو أعد تشغيل الخادم
npm start --tunnel
```

### 5. مشاكل npm
```bash
# امسح الـ cache
npm cache clean --force

# ثبت الإصدار الصحيح
npm install --legacy-peer-deps
```

---

## التحقق من التثبيت

### تحقق من الخوادم
```bash
# التحقق من Backend
curl http://localhost:5000/health

# يجب أن تحصل على:
# {"status":"ok","timestamp":"..."}
```

### تحقق من الواجهة
- افتح http://localhost:19000 (Expo DevTools)
- أو ادخل إلى التطبيق من Expo Go على هاتفك

---

## الخطوات التالية

✅ قم بقراءة `/docs/SETUP.md` للتطوير المتقدم
✅ اقرأ `/docs/API.md` لفهم الـ APIs
✅ ابدأ بتطوير الميزات الجديدة!

---

**هل تحتاج مساعدة؟**
أفتح issue على GitHub أو تواصل مع المجتمع! 🤝
