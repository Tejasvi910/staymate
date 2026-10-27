import express from 'express';
import {
  getCampuses,
  getCampusById,
  createCampus,
  updateCampus,
  addStaffToCampus,
  removeStaffFromCampus,
} from '../controllers/campusController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('manager', 'warden', 'accountant', 'admin'), getCampuses)
  .post(protect, authorize('manager', 'admin'), createCampus);

router
  .route('/:id')
  .get(protect, getCampusById)
  .put(protect, authorize('manager', 'warden', 'admin'), updateCampus);

router
  .route('/:id/staff')
  .post(protect, authorize('manager', 'warden', 'admin'), addStaffToCampus);

router
  .route('/:id/staff/:staffId')
  .delete(protect, authorize('manager', 'warden', 'admin'), removeStaffFromCampus);

export default router;
