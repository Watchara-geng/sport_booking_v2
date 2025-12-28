import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { sendLinePushMany } from '../utils/lineMessaging';

export function startBookingCleaner() {
  // ทุก ๆ 5 นาที
  const task = cron.schedule('*/5 * * * *', async () => {
    try {
      const threshold = new Date(Date.now() - 15 * 60 * 1000);

      const stale = await prisma.booking.findMany({
        where: {
          status: 'pending',
          createdAt: { lt: threshold }
        },
        select: { id: true }
      });

      if (stale.length === 0) return;

      const ids = stale.map((b) => b.id);
      await prisma.booking.updateMany({
        where: { id: { in: ids } },
        data: { status: 'cancelled' }
      });

      try {
        const adminsCsv = process.env.LINE_PUSH_TO;
        await sendLinePushMany(adminsCsv, `⏰ Auto-cancel ${stale.length} booking(s) ที่ค้างเกิน 15 นาที\n• ${ids.join(', ')}`);
      } catch {}

      // eslint-disable-next-line no-console
      console.log(`[Cleaner] auto-cancelled: ${ids.join(', ')}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Cleaner] error:', err);
    }
  });

  task.start();
  return task;
}
