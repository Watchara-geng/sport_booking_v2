import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateLogin, validateRegister } from '../middlewares/validateAuth';
import { authGuard } from '../middlewares/authGuard';

const router = Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/me', authGuard, authController.me);

export default router;
