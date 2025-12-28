import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { AuthRequest } from '../middlewares/authGuard';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json({ success: true, message: 'Registered successfully', data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json({ success: true, message: 'Logged in', data: result });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await authService.me(req.user!.userId);
    return res.status(200).json({ success: true, message: 'OK', data });
  } catch (err) {
    next(err);
  }
}
