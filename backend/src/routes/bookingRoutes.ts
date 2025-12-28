// backend/src/routes/bookingRoutes.ts
import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { authGuard, adminGuard } from '../middlewares/authGuard';
import { validateCreateBooking, validateUpdateStatus } from '../middlewares/validateBooking';
import { getAvailability } from '../controllers/bookingController';

const router = Router();

router.post('/', authGuard, validateCreateBooking, bookingController.createBooking);
router.get('/my', authGuard, bookingController.getMyBookings);
router.patch('/cancel/:id', authGuard, bookingController.cancelMyBooking);
router.patch('/:id/status', authGuard, adminGuard, validateUpdateStatus, bookingController.adminUpdateStatus);
router.get('/availability', authGuard, getAvailability);

export default router;
