# دليل النشر (Deployment) 🚀

## النشر على الخوادم

### المتطلبات
- Docker (اختياري لكن موصى به)
- Node.js 16+
- PostgreSQL database
- Redis cache
- AWS/GCP/Azure account

### خطوات النشر

#### 1. تحضير الخادم
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# تثبيت Redis
sudo apt install -y redis-server
```

#### 2. استنساخ المشروع
```bash
git clone https://github.com/YOUR_USERNAME/islamic-companion.git
cd islamic-companion
```

#### 3. إعداد المتغيرات البيئية
```bash
cd backend
cp .env.example .env

# عدّل البيانات الحساسة
nano .env
```

#### 4. تثبيت المكتبات والنشر
```bash
npm install --production
npm run migrate  # تشغيل الهجرات

# بدء الخادم
pm2 start src/index.js --name "islamic-api"
pm2 save
pm2 startup
```

#### 5. إعداد Nginx كـ Reverse Proxy
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 6. تفعيل HTTPS
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d api.your-domain.com
```

### Docker Deployment

#### Dockerfile للـ Backend
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### تشغيل مع Docker Compose
```bash
docker-compose up -d
```

### المراقبة والصيانة

#### التحقق من الحالة
```bash
pm2 monit
pm2 logs islamic-api
```

#### النسخ الاحتياطية
```bash
# backup PostgreSQL
pg_dump -U postgres islamic_companion > backup.sql

# restore
psql -U postgres islamic_companion < backup.sql
```

#### التحديثات
```bash
git pull origin main
npm install
npm run migrate
pm2 restart islamic-api
```

---

**احرص على الأمان دائماً! 🔒**
