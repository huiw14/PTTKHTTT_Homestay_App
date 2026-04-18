import express from 'express';
import roomController from '../controllers/roomController.js';
import { requireRoles } from '../middlewares/authGuard.js';

const router = express.Router();

router.get('/', requireRoles('sale', 'quanly', 'admin'), roomController.getRooms);

export default router;
