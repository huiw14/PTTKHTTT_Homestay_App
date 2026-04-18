import express from 'express';
import branchController from '../controllers/branchController.js';

const router = express.Router();

router.get('/', branchController.getBranches);

export default router;
