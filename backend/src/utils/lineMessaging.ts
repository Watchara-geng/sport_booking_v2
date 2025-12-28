import axios from 'axios';

const LINE_PUSH_ENDPOINT = 'https://api.line.me/v2/bot/message/push';
const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

/**
 * ส่งข้อความหา userId เดี่ยว
 */
export async function sendLinePush(to: string, text: string) {
  if (!ACCESS_TOKEN) return; // ไม่ตั้งค่าไว้ ก็ข้ามเงียบ ๆ
  if (!to) return;

  try {
    await axios.post(
      LINE_PUSH_ENDPOINT,
      {
        to,
        messages: [{ type: 'text', text }]
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[LINE Messaging] push failed:', err);
  }
}

/**
 * ส่งข้อความหาหลายคน (คั่น userId ด้วย comma)
 * เช่น: "Uxxxxxxxxx1,Uxxxxxxxxx2"
 */
export async function sendLinePushMany(toCsv: string | undefined, text: string) {
  if (!toCsv) return;
  const ids = toCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // ส่งทีละคนแบบง่าย ๆ (ถ้าต้องการประสิทธิภาพสูง ค่อยเปลี่ยนเป็น multicast API)
  for (const id of ids) {
    // ไม่ await ทั้งหมดพร้อมกัน เพื่อเบรก rate limit เบื้องต้น
    // eslint-disable-next-line no-await-in-loop
    await sendLinePush(id, text);
  }
}
