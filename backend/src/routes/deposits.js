import express from 'express';
import depositController from '../controllers/depositController.js';

const router = express.Router();

// Get available rooms for creating deposit (real-time from db)
router.get('/available-rooms', depositController.getAvailableRooms);

// Get available beds for a room (real-time from db)
router.get('/available-beds', depositController.getAvailableBeds);

// List tất cả deposits (có thể filter)
router.get('/', depositController.getDeposits);

// Get chi tiết 1 deposit
router.get('/:id', depositController.getDepositDetail);

// Create deposit mới
router.post('/', depositController.createDeposit);

// Send payment request email
router.post('/:id/send-payment-request', depositController.sendPaymentRequest);

// Approve payment (duyệt thanh toán)
router.post('/:id/approve', depositController.approvePayment);

// Update status deposit
router.put('/:id', depositController.updateDeposit);

// Delete deposit
router.delete('/:id', depositController.deleteDeposit);

export default router;
