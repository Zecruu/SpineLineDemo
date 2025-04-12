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
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all appointments
router.get('/', verifyFirebaseToken, getAllAppointments);

// Get appointment by ID
router.get('/:id', verifyFirebaseToken, getAppointmentById);

// Create new appointment
router.post('/', verifyFirebaseToken, [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('doctorId').notEmpty().withMessage('Doctor ID is required'),
    body('appointmentDate').notEmpty().withMessage('Appointment date is required').isISO8601().withMessage('Invalid date format'),
    body('status').notEmpty().withMessage('Status is required').isIn(['scheduled', 'pending', 'completed', 'cancelled']).withMessage('Invalid status'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ], createAppointment);

// Update appointment
router.put('/:id', verifyFirebaseToken, [
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
], updateAppointment);

// Cancel appointment
router.put('/:id/cancel', verifyFirebaseToken, cancelAppointment);

// Check in patient for appointment
router.put('/:id/checkin', verifyFirebaseToken, checkInAppointment);

// Mark appointment as completed
router.put('/:id/complete', verifyFirebaseToken, checkRole(['doctor', 'admin']), completeAppointment);

export default router;