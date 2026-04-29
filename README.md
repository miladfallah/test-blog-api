# Blog API - NestJS + Prisma + PostgreSQL

## 🚀 راه‌اندازی پروژه

### پیش‌نیازها

- Node.js v18+
- PostgreSQL
- npm یا yarn

### مراحل نصب

```bash
# 1. clone مخزن
git clone https://github.com/miladfallah/test-blog-api.git
cd blog-api

# 2. نصب وابستگی‌ها
npm install

# 3. کپی فایل محیطی
cp .env .env
# سپس فایل .env را با مقادیر واقعی پر کنید

# 4. اجرای migrations
npx prisma migrate dev --name init

# 5. تولید Prisma Client
npm run prisma:generate

# 6. اجرا در حالت توسعه
npm run start:dev
```
