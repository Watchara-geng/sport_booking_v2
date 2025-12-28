import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email(),
  password: z.string().min(6, 'password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'password is required')
});

function makeValidator(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      return res.status(400).json({ success: false, message: 'Validation error', data: errors });
    }
    // Assign parsed data back to body to ensure types
    req.body = result.data;
    next();
  };
}

export const validateRegister = makeValidator(registerSchema);
export const validateLogin = makeValidator(loginSchema);
