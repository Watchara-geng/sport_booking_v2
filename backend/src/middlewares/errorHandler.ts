import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Basic logging
  // eslint-disable-next-line no-console
  console.error('[ErrorHandler]', err);

  const status = err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';

  return res.status(status).json({
    success: false,
    message,
    data: process.env.NODE_ENV === 'development' ? err : undefined
  });
}
