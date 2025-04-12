import express from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  checkInAppointment,
  completeAppointment
} from '../controllers/appointmentController.js';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get all appointments
router.get('/', verifyFirebaseToken, getAllAppointments);

// Get appointment by ID
router.get('/:id', verifyFirebaseToken, getAppointmentById);

// Create new appointment
router.post('/', verifyFirebaseToken, createAppointment);

// Update appointment
router.put('/:id', verifyFirebaseToken, updateAppointment);

// Cancel appointment
router.put('/:id/cancel', verifyFirebaseToken, cancelAppointment);

// Check in patient for appointment
router.put('/:id/checkin', verifyFirebaseToken, checkInAppointment);

// Mark appointment as completed
router.put('/:id/complete', verifyFirebaseToken, checkRole(['doctor', 'admin']), completeAppointment);

export default router;