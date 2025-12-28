import { Request, Response, NextFunction } from 'express';
import * as fieldService from '../services/fieldService';

export async function getFields(req: Request, res: Response, next: NextFunction) {
  try {
    const fields = await fieldService.listFields();
    res.json({ success: true, data: fields });
  } catch (err) {
    next(err);
  }
}
