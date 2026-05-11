import express from 'express';
import memberController from '../controllers/memberController.js';
import { requireRoles } from '../middlewares/authGuard.js';

const router = express.Router();

router.get('/', requireRoles('sale', 'quanly', 'admin'), memberController.getMembers);
router.get('/:id', requireRoles('sale', 'quanly', 'admin'), memberController.getMemberDetail);
router.put('/:id/status', requireRoles('quanly', 'admin'), memberController.updateMemberStatus);
router.post('/review', requireRoles('quanly', 'admin'), memberController.reviewMemberConditions);

export default router;
