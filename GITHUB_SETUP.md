# 📤 دليل رفع المشروع على GitHub

## الخطوات الكاملة والدقيقة

### الخطوة 1️⃣: إنشاء حساب GitHub (إذا لم تملك حساب)

1. اذهب إلى https://github.com
2. اضغط **Sign up**
3. أتبع الخطوات:
   - أدخل البريد الإلكتروني
   - اختر كلمة مرور قوية
   - اختر اسم المستخدم (مثل: `your-username`)
   - تحقق من البريد الإلكتروني

---

### الخطوة 2️⃣: إنشاء Repository جديد

1. بعد تسجيل الدخول، اذهب إلى https://github.com/new
2. ملء البيانات:

| الحقل | القيمة |
|------|--------|
| Repository name | `islamic-companion` |
| Description | تطبيق إسلامي شامل |
| Privacy | Public (عام) |
| Initialize | **اترك فارغاً** |

3. اضغط **Create repository**

---

### الخطوة 3️⃣: تثبيت Git (إذا لم تملكه)

**على Windows:**
```bash
# عبر Chocolatey
choco install git

# أو من الموقع الرسمي
# https://git-scm.com/download/win
```

**على macOS:**
```bash
brew install git
```

**على Linux:**
```bash
sudo apt install git
```

**تحقق من التثبيت:**
```bash
git --version
```

---

### الخطوة 4️⃣: إعداد Git محلياً

```bash
# 1. تعيين البريد الإلكتروني
git config --global user.email "your-email@example.com"

# 2. تعيين اسم المستخدم
git config --global user.name "Your Name"

# 3. التحقق
git config --list
```

---

### الخطوة 5️⃣: رفع المشروع على GitHub

افتح Terminal/Command Prompt في مجلد `finalp`:

```bash
# 1. تهيئة Repository محلي (إذا لم يكن موجوداً)
git init

# 2. إضافة جميع الملفات
git add .

# 3. إنشاء أول commit
git commit -m "Initial commit: Islamic Companion MVP Phase 1"

# 4. تعيين الفرع الرئيسي
git branch -M main

# 5. ربط مع GitHub (استبدل YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/islamic-companion.git

# 6. رفع المشروع
git push -u origin main
```

---

### الخطوة 6️⃣: التحقق من الرفع

1. اذهب إلى: `https://github.com/YOUR_USERNAME/islamic-companion`
2. تأكد من ظهور جميع الملفات
3. تحقق من أن README.md معروض بشكل صحيح

---

## ⚙️ خطوات إضافية مهمة

### إنشاء File `.github/workflows/ci.yml` (CI/CD اختياري)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x]

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}

    - name: Install Backend
      run: |
        cd backend
        npm ci

    - name: Run Backend Tests
      run: |
        cd backend
        npm test

    - name: Install Frontend
      run: |
        cd frontend
        npm ci
```

---

## 📝 نصائح مهمة

### 1. كلمات مرور GitHub Token (للأمان)

بدلاً من استخدام كلمة المرور، استخدم Personal Access Token:

1. Settings → Developer settings → Personal access tokens
2. Generate new token
3. حدد الصلاحيات: `repo`
4. استخدم الـ token بدلاً من كلمة المرور

**الأمر:**
```bash
git remote set-url origin https://TOKEN@github.com/YOUR_USERNAME/islamic-companion.git
```

### 2. ملف `.gitignore` محسّن

تأكد من أن `.gitignore` يحتوي على:
```
node_modules/
.env
.env.local
.DS_Store
*.log
dist/
build/
```

### 3. إضافة README بـ GitHub

يمكنك إضافة صورة أو شرح مرئي:

```markdown
## 🎥 Demo

![App Preview](./images/demo.gif)
```

---

## 🔄 تحديثات لاحقة

### إضافة ملفات جديدة
```bash
git add .
git commit -m "feat: إضافة ميزة جديدة"
git push origin main
```

### تعديل ملفات موجودة
```bash
git add .
git commit -m "fix: إصلاح خطأ معين"
git push origin main
```

### إنشاء فرع للميزات الجديدة
```bash
# إنشاء فرع جديد
git checkout -b feature/my-feature

# بعد الانتهاء
git push origin feature/my-feature

# ثم أنشئ Pull Request على GitHub
```

---

## 🆘 مشاكل شائعة وحلولها

### المشكلة: "fatal: not a git repository"
```bash
# الحل:
git init
```

### المشكلة: "Permission denied"
```bash
# استخدم HTTPS بدلاً من SSH
git remote set-url origin https://github.com/YOUR_USERNAME/islamic-companion.git
```

### المشكلة: "Cannot push to origin"
```bash
# تحقق من الاتصال
git remote -v

# وأعد المحاولة
git push -u origin main
```

### المشكلة: "Branch protection rules"
- على GitHub، اذهب إلى Settings → Branches
- أضف قواعد حماية للفرع الرئيسي (اختياري)

---

## 🎉 النتيجة النهائية

بعد اتمام جميع الخطوات، ستحصل على:

✅ مشروع على GitHub
✅ كل الملفات والوثائق
✅ رابط دائم للمشروع
✅ إمكانية المشاركة والمساهمة من الآخرين

---

## 🔗 الروابط المهمة

- **حسابك على GitHub**: https://github.com/YOUR_USERNAME
- **المشروع**: https://github.com/YOUR_USERNAME/islamic-companion
- **الإعدادات**: https://github.com/YOUR_USERNAME/islamic-companion/settings
- **التصادمات**: https://github.com/YOUR_USERNAME/islamic-companion/issues
- **Pull Requests**: https://github.com/YOUR_USERNAME/islamic-companion/pulls

---

**انتهيت؟ تهانينا! 🎊 مشروعك الآن على GitHub!**
