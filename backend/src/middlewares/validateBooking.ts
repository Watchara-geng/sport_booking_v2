// backend/src/middlewares/validateBooking.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const createBookingSchema = z.object({
  fieldId: z.string().min(1),
  amount: z.number().positive(),
  startTime: z.string().datetime(), // ISO
  endTime: z.string().datetime()    // ISO
});

export const updateStatusSchema = z.object({
  status: z.enum(['confirmed', 'cancelled']),
  reason: z.string().optional()
});

function validate(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      return res.status(400).json({ success: false, message: 'Validation error', data: errors });
    }
    req.body = parsed.data;
    next();
  };
}

export const validateCreateBooking = validate(createBookingSchema);
export const validateUpdateStatus = validate(updateStatusSchema);
