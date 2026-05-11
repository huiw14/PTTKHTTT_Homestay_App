import express from 'express';
import employeeController from '../controllers/employeeController.js';
import { requireRoles } from '../middlewares/authGuard.js';

const router = express.Router();

router.get('/', requireRoles('sale', 'quanly', 'admin'), employeeController.getEmployees);

export default router;
