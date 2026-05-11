import express from 'express';
import depositController from '../controllers/depositController.js';
import { requireRoles } from '../middlewares/authGuard.js';

const router = express.Router();

// Get available rooms for creating deposit (real-time from db)
router.get('/available-rooms', requireRoles('sale', 'quanly', 'admin'), depositController.getAvailableRooms);

// Get available beds for a room (real-time from db)
router.get('/available-beds', requireRoles('sale', 'quanly', 'admin'), depositController.getAvailableBeds);

// List tất cả deposits (có thể filter)
router.get('/', requireRoles('sale', 'quanly', 'ketoan', 'admin'), depositController.getDeposits);

// Get chi tiết 1 deposit
router.get('/:id', requireRoles('sale', 'quanly', 'ketoan', 'admin'), depositController.getDepositDetail);

// Create deposit mới
router.post('/', requireRoles('sale', 'quanly', 'admin'), depositController.createDeposit);

// Send payment request email
router.post('/:id/send-payment-request', requireRoles('ketoan', 'quanly', 'admin'), depositController.sendPaymentRequest);

// Approve payment (duyệt thanh toán)
router.post('/:id/approve', requireRoles('quanly', 'admin'), depositController.approvePayment);

// Update status deposit
router.put('/:id', requireRoles('quanly', 'admin'), depositController.updateDeposit);

// Delete deposit
router.delete('/:id', requireRoles('quanly', 'admin'), depositController.deleteDeposit);

export default router;
