import express from 'express';
import appointmentController from '../controllers/appointmentController.js';
import { requireRoles } from '../middlewares/authGuard.js';

const router = express.Router();

router.get('/', requireRoles('sale', 'quanly', 'admin'), appointmentController.getAppointments);
router.post('/', requireRoles('sale', 'quanly', 'admin'), appointmentController.createAppointment);
router.put('/:id', requireRoles('sale', 'quanly', 'admin'), appointmentController.updateAppointment);

export default router;
