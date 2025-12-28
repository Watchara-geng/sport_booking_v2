# Batch D — Booking + PromptPay + Cron + LINE Messaging API

## เปลี่ยนจาก LINE Notify → LINE Messaging API
เราจะใช้ **Push Message** ของ LINE Messaging API แทน LINE Notify

### ต้องเตรียมใน LINE Developers Console
1) สร้าง LINE Official Account + Messaging API channel  
2) คัดลอก **Channel access token (long-lived)**  
3) หา **User ID** ของผู้ดูแลที่จะรับแจ้ง (เช่น จากหน้า Testers/Contacts หรือผ่าน webhook/LIFF)  
   - หากมีหลายคน ให้คั่นด้วย `,` (comma)

### .env (ตัวอย่าง)
