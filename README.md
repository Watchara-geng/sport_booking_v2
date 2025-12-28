# Sports Booking System (PromptPay Edition)

Monorepo: Backend (Express + Prisma + PostgreSQL + TS), Frontend (React + Vite + Tailwind + shadcn/ui + TS).
Payment ใช้ **PromptPay QR** (ไม่มีการอัพโหลดสลิป). มี Cron Auto-Cancel และ LINE Notify.

## Quick Start (Docker)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d --build"# sport_booking_v2" 
