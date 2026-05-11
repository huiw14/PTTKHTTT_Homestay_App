import express from 'express';
import branchController from '../controllers/branchController.js';
import { requireRoles } from '../middlewares/authGuard.js';

const router = express.Router();

router.get('/', requireRoles('sale', 'quanly', 'ketoan', 'admin'), branchController.getBranches);

export default router;
