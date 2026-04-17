import express from 'express';
import customerController from '../controllers/customerController.js';

const router = express.Router();

router.get('/', customerController.getCustomers);
router.post('/', customerController.createCustomer);

export default router;
