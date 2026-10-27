import express from 'express';
import {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, createComplaint)
  .get(protect, getComplaints);

router.put(
  '/:id/status',
  protect,
  authorize('manager', 'warden', 'admin'),
  updateComplaintStatus
);

export default router;
