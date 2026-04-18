import express from 'express';
import requestController from '../controllers/requestController.js';
import { requireRoles } from '../middlewares/authGuard.js';

const router = express.Router();

router.get('/', requireRoles('sale', 'quanly', 'admin'), requestController.getRequests);
router.post('/', requireRoles('sale', 'quanly', 'admin'), requestController.createRequest);
router.put('/:id', requireRoles('sale', 'quanly', 'admin'), requestController.updateRequest);
router.delete('/:id', requireRoles('sale', 'quanly', 'admin'), requestController.deleteRequest);

export default router;
