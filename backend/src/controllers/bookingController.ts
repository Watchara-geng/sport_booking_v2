// backend/src/controllers/bookingController.ts
import { Request,Response, NextFunction } from 'express';
import * as bookingService from '../services/bookingService';
import { AuthRequest } from '../middlewares/authGuard';
import { prisma } from '../config/prisma';
export async function createBooking(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { fieldId, amount, startTime, endTime } = req.body;
    const booking = await bookingService.createBooking({
      userId: req.user!.userId,
      fieldId,
      amount,
      startTime,
      endTime
    });
    res.status(201).json({ success: true, message: 'Booking created', data: booking });
  } catch (err) {
    next(err);
  }
}

export async function getMyBookings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, page = '1', pageSize = '10' } = req.query as any;
    const result = await bookingService.listMyBookings(
      req.user!.userId,
      status,
      Number(page),
      Number(pageSize)
    );
    res.json({ success: true, message: 'OK', data: result });
  } catch (err) {
    next(err);
  }
}

export async function cancelMyBooking(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updated = await bookingService.cancelMyBooking(req.user!.userId, id);
    res.json({ success: true, message: 'Cancelled', data: updated });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body as any;
    const updated = await bookingService.adminUpdateStatus(id, status, reason);
    res.json({ success: true, message: 'Status updated', data: updated });
  } catch (err) {
    next(err);
  }
}

export async function getAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const { fieldId, date } = req.query;
    if (!fieldId || !date) {
      return res.status(400).json({ success: false, message: 'fieldId and date required' });
    }

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const slots = await prisma.bookingSlot.findMany({
      where: {
        booking: {
          fieldId: String(fieldId),
          status: { in: ['pending', 'confirmed'] }
        },
        startTime: { gte: startOfDay },
        endTime: { lte: endOfDay }
      },
      select: { startTime: true, endTime: true }
    });

    res.json({ success: true, data: { slots } });
  } catch (err) {
    next(err);
  }
}
