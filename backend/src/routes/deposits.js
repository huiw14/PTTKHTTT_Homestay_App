import express from 'express';
import depositController from '../controllers/depositController.js';

const router = express.Router();

// List tất cả deposits (có thể filter)
router.get('/', depositController.getDeposits);

// Get chi tiết 1 deposit
router.get('/:id', depositController.getDepositDetail);

// Create deposit mới
router.post('/', depositController.createDeposit);

// Update status deposit
router.put('/:id', depositController.updateDeposit);

// Delete deposit
router.delete('/:id', depositController.deleteDeposit);

export default router;
