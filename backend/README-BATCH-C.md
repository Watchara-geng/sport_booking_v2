# Batch C — Auth Module

โมดูลนี้เพิ่มระบบสมัคร/ล็อกอินด้วย JWT บน Express + Prisma + TypeScript

## Endpoints
- `POST /api/auth/register` — สมัครสมาชิก
- `POST /api/auth/login` — ล็อกอิน, คืน JWT
- `GET /api/auth/me` — คืนข้อมูลผู้ใช้ตาม JWT

### Response format
```json
{ "success": true, "message": "text", "data": { ... } }
