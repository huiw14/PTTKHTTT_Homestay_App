import express from 'express';
import customerController from '../controllers/customerController.js';
import { requireRoles } from '../middlewares/authGuard.js';

const router = express.Router();

router.get('/', requireRoles('sale', 'quanly', 'admin'), customerController.getCustomers);
router.post('/', requireRoles('sale', 'quanly', 'admin'), customerController.createCustomer);
router.get('/:id', requireRoles('sale', 'quanly', 'admin'), customerController.getCustomerDetail);
router.put('/:id', requireRoles('quanly', 'admin'), customerController.updateCustomer);
router.delete('/:id', requireRoles('quanly', 'admin'), customerController.deleteCustomer);

export default router;
