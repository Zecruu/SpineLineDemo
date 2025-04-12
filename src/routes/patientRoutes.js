import express from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  addInsurance,
  addReferral,
  addAlert
} from '../controllers/patientController.js';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get all patients
router.get('/', verifyFirebaseToken, getAllPatients);

// Get patient by ID
router.get('/:id', verifyFirebaseToken, getPatientById);

// Create new patient
router.post('/', verifyFirebaseToken, createPatient);

// Update patient
router.put('/:id', verifyFirebaseToken, updatePatient);

// Add insurance to patient
router.post('/:id/insurance', verifyFirebaseToken, addInsurance);

// Add referral to patient
router.post('/:id/referral', verifyFirebaseToken, checkRole(['doctor', 'admin']), addReferral);

// Add alert to patient
router.post('/:id/alert', verifyFirebaseToken, addAlert);

export default router;