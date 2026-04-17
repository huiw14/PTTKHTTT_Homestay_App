import express from 'express';
import roomController from '../controllers/roomController.js';

const router = express.Router();

router.get('/', roomController.getRooms);

export default router;
