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
import { body, param, validationResult } from 'express-validator';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get all patients
router.get('/', verifyFirebaseToken, getAllPatients);

// Get patient by ID
router.get('/:id', [
    param('id').isMongoId().withMessage('Invalid patient ID format'),
    verifyFirebaseToken,
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, getPatientById);

// Create new patient
router.post('/', [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('dateOfBirth').isDate().withMessage('Date of birth must be a valid date'),
    body('gender').notEmpty().withMessage('Gender is required').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
    verifyFirebaseToken,
  ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }, createPatient);

// Update patient
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid patient ID format'),
  body('firstName').optional().notEmpty().withMessage('First name is required'),
  body('lastName').optional().notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').optional().isDate().withMessage('Date of birth must be a valid date'),
  body('gender').optional().notEmpty().withMessage('Gender is required').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  verifyFirebaseToken,
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, updatePatient);

// Add insurance to patient
router.post('/:id/insurance', [
    param('id').isMongoId().withMessage('Invalid patient ID format'),
    body('insuranceProvider').notEmpty().withMessage('Insurance provider is required'),
    body('policyNumber').notEmpty().withMessage('Policy number is required'),
    verifyFirebaseToken,
  ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }, addInsurance);

// Add referral to patient
router.post('/:id/referral', [
    param('id').isMongoId().withMessage('Invalid patient ID format'),
    verifyFirebaseToken, checkRole(['doctor', 'admin']),
  ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }, addReferral);

// Add alert to patient
router.post('/:id/alert', [param('id').isMongoId().withMessage('Invalid patient ID format'), verifyFirebaseToken,
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, addAlert);

export default router;