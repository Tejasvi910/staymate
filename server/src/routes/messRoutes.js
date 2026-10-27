import express from 'express';
import {
  getMessMenu,
  upsertMessMenu,
  updateMessMenu,
  predictHeadcount,
} from '../controllers/messController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/predict', protect, predictHeadcount);

router
  .route('/')
  .get(getMessMenu)
  .post(protect, authorize('manager', 'warden', 'admin'), upsertMessMenu);

router.put('/:id', protect, authorize('manager', 'warden', 'admin'), updateMessMenu);

export default router;
