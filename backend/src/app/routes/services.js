import express from 'express';
import receiptController from '../controllers/receiptController.js';
import handoverController from '../controllers/handoverController.js';
import { requireRoles } from '../middlewares/authGuard.js';

const router = express.Router();

// ─── PHIẾU THU (RECEIPTS) ─────────────────────────────────────────────────

router.get('/receipts', requireRoles('ketoan', 'quanly', 'admin'), receiptController.getReceipts);
router.get('/receipts/:id', requireRoles('ketoan', 'quanly', 'admin'), receiptController.getReceiptDetail);
router.post('/receipts', requireRoles('ketoan', 'quanly', 'admin'), receiptController.createReceipt);
router.post('/receipts/:id/confirm', requireRoles('ketoan', 'quanly', 'admin'), receiptController.confirmReceipt);

// ─── BIÊN BẢN BÀN GIAO (HANDOVERS) ───────────────────────────────────────

router.get('/handovers', requireRoles('sale', 'quanly', 'admin'), handoverController.getHandovers);
router.get('/handovers/:id', requireRoles('sale', 'quanly', 'admin'), handoverController.getHandoverDetail);
router.post('/handovers', requireRoles('sale', 'quanly', 'admin'), handoverController.createHandover);

// ─── BIÊN BẢN TRẢ PHÒNG (CHECKOUTS) ───────────────────────────────────────

router.get('/checkouts', requireRoles('sale', 'quanly', 'admin'), handoverController.getCheckouts);
router.get('/checkouts/:id', requireRoles('sale', 'quanly', 'admin'), handoverController.getCheckoutDetail);
router.post('/checkouts', requireRoles('sale', 'quanly', 'admin'), handoverController.createCheckout);

export default router;
