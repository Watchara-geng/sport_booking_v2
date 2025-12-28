import { Router } from 'express';
import * as fieldController from '../controllers/fieldController';

const router = Router();

router.get('/', fieldController.getFields);

export default router;
