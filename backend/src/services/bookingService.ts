import { prisma } from '../config/prisma';
import { buildPromptPayQr } from '../utils/promptpay';
import { sendLinePushMany } from '../utils/lineMessaging';

type CreateBookingInput = {
  userId: string;
  fieldId: string;
  amount: number;
  startTime: string; // ISO
  endTime: string;   // ISO
};

export async function createBooking(input: CreateBookingInput) {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  if (!(start < end)) {
    const err: any = new Error('startTime must be before endTime');
    err.statusCode = 400;
    throw err;
  }
  if (start.getTime() < Date.now()) {
    const err: any = new Error('startTime must be in the future');
    err.statusCode = 400;
    throw err;
  }

  // ตรวจซ้อนทับ (overlap)
  const overlap = await prisma.bookingSlot.findFirst({
    where: {
      booking: {
        fieldId: input.fieldId,
        status: { in: ['pending', 'confirmed'] }
      },
      NOT: {
        OR: [
          { endTime: { lte: start } },
          { startTime: { gte: end } }
        ]
      }
    },
    select: { id: true }
  });

  if (overlap) {
    const err: any = new Error('Time slot overlaps with existing booking');
    err.statusCode = 409;
    throw err;
  }

  const { dataUrl } = await buildPromptPayQr(input.amount);

  const booking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        userId: input.userId,
        fieldId: input.fieldId,
        amount: input.amount,
        status: 'pending',
        promptPayQrUrl: dataUrl
      }
    });

    await tx.bookingSlot.create({
      data: {
        bookingId: b.id,
        startTime: start,
        endTime: end
      }
    });

    return b;
  });

  // แจ้งผ่าน LINE Messaging API (ถ้ามีการตั้งค่าผู้รับ)
  try {
    const field = await prisma.field.findUnique({ where: { id: booking.fieldId }, include: { branch: true } });
    if (!field) {
        const err: any = new Error(`Field not found: ${input.fieldId}`);
        err.statusCode = 400;
        throw err;
        }
    const adminsCsv = process.env.LINE_PUSH_TO; // รองรับหลาย userId คั่นด้วย comma
    await sendLinePushMany(
      adminsCsv,
      [
        '🆕 มีการจองใหม่',
        `• Booking: ${booking.id}`,
        `• Field: ${field?.name} @ ${field?.branch?.name}`,
        `• Amount: ${booking.amount}`,
        `• Status: ${booking.status}`,
        `• เวลา: ${start.toLocaleString()} - ${end.toLocaleString()}`
      ].join('\n')
    );
  } catch (e) {
    // เงียบไว้
  }

  return booking;
}

export async function listMyBookings(userId: string, status?: 'pending'|'confirmed'|'cancelled', page = 1, pageSize = 10) {
  const where: any = { userId };
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { field: { include: { branch: true } }, slots: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.booking.count({ where })
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

export async function cancelMyBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== userId) {
    const err: any = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  if (booking.status !== 'pending') {
    const err: any = new Error('Only pending booking can be cancelled');
    err.statusCode = 400;
    throw err;
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'cancelled' }
  });
}

export async function adminUpdateStatus(bookingId: string, status: 'confirmed'|'cancelled', reason?: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    const err: any = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status }
  });

  try {
    const adminsCsv = process.env.LINE_PUSH_TO;
    await sendLinePushMany(
      adminsCsv,
      [
        '🛠️ Admin เปลี่ยนสถานะ',
        `• Booking: ${bookingId}`,
        `• New status: ${status}`,
        reason ? `• Reason: ${reason}` : ''
      ].filter(Boolean).join('\n')
    );
  } catch {}

  return updated;
}
