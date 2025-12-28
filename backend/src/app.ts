// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';   // ✅ เพิ่มบรรทัดนี้
import { errorHandler } from './middlewares/errorHandler';
import { startBookingCleaner } from './jobs/bookingCleaner'; // (ออปชัน) ใช้ cron auto-cancel
import fieldRoutes from './routes/fieldRoutes';
dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Backend running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);              // ✅ เพิ่มบรรทัดนี้
app.use('/api/fields', fieldRoutes);

// Error handler (must be last middleware)
app.use(errorHandler);

const PORT = Number(process.env.PORT || 4000);
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`);
  });

  // (ออปชัน) เริ่ม cron job auto-cancel ทุก 5 นาที
  startBookingCleaner();
}

export default app;
