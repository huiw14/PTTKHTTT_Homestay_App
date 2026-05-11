import express from 'express';
import checkoutWorkflowController from '../controllers/checkoutWorkflowController.js';
import { requireRoles } from '../middlewares/authGuard.js';

const router = express.Router();

router.get('/workflows', requireRoles('sale', 'quanly', 'admin', 'ketoan'), checkoutWorkflowController.getCheckoutWorkflows);
router.put('/workflows', requireRoles('sale', 'quanly', 'admin', 'ketoan'), checkoutWorkflowController.saveCheckoutWorkflows);

export default router;
