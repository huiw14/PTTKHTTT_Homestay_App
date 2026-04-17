import express from 'express';
import appointmentController from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/', appointmentController.getAppointments);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);

export default router;
