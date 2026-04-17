import express from 'express';
import customerController from '../controllers/customerController.js';

const router = express.Router();

// List all customers
router.get('/', customerController.getCustomers);

export default router;
