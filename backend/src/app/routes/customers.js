import express from 'express';
import customerController from '../controllers/customerController.js';
import { requireRoles } from '../middlewares/authGuard.js';

const router = express.Router();

router.get('/', requireRoles('sale', 'quanly', 'admin'), customerController.getCustomers);
router.post('/', requireRoles('sale', 'quanly', 'admin'), customerController.createCustomer);

export default router;
