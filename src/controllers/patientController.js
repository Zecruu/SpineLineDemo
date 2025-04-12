import Patient from '../models/Patient.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * Get all patients
 */
export const getAllPatients = async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Add filtering
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { 'contactInfo.email': searchRegex },
        { 'contactInfo.phone': searchRegex }
      ];
    }
    
    const patients = await Patient.find(filter)
      .select('-__v')
      .skip(skip)
      .limit(limit)
      .sort({ lastName: 1, firstName: 1 });
    
    const total = await Patient.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      count: patients.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: patients
    });
  } catch (error) {
    console.error('Error getting patients:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Get patient by ID
 */
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select('-__v');
    
    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Patient not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error getting patient:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Create new patient
 */
export const createPatient = async (req, res) => {
  try {
    // Add the user who created the patient
    req.body.createdBy = req.user.mongoId;
    
    const patient = await Patient.create(req.body);
    
    // Log the creation
    await createAuditLog({
      action: 'PATIENT_CREATED',
      performedBy: req.user.mongoId,
      resourceType: 'PATIENT',
      resourceId: patient._id,
      details: { patientId: patient._id, patientName: `${patient.firstName} ${patient.lastName}` }
    });
    
    return res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Update patient
 */
export const updatePatient = async (req, res) => {
  try {
    // Add the user who updated the patient
    req.body.updatedBy = req.user.mongoId;
    
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Patient not found'
      });
    }
    
    // Update patient
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    // Log the update
    await createAuditLog({
      action: 'PATIENT_UPDATED',
      performedBy: req.user.mongoId,
      resourceType: 'PATIENT',
      resourceId: updatedPatient._id,
      details: { 
        patientId: updatedPatient._id, 
        patientName: `${updatedPatient.firstName} ${updatedPatient.lastName}`,
        updatedFields: Object.keys(req.body)
      }
    });
    
    return res.status(200).json({
      success: true,
      data: updatedPatient
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Add insurance to patient
 */
export const addInsurance = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Patient not found'
      });
    }
    
    // Add verification info
    req.body.verificationDate = new Date();
    req.body.verifiedBy = req.user.mongoId;
    
    // Add insurance to patient
    patient.insurance.push(req.body);
    patient.updatedBy = req.user.mongoId;
    await patient.save();
    
    // Log the insurance addition
    await createAuditLog({
      action: 'PATIENT_INSURANCE_ADDED',
      performedBy: req.user.mongoId,
      resourceType: 'PATIENT',
      resourceId: patient._id,
      details: { 
        patientId: patient._id, 
        patientName: `${patient.firstName} ${patient.lastName}`,
        insuranceProvider: req.body.provider,
        policyNumber: req.body.policyNumber
      }
    });
    
    return res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error adding insurance:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Add referral to patient
 */
export const addReferral = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Patient not found'
      });
    }
    
    // Calculate remaining visits
    req.body.visitCount.remaining = req.body.visitCount.authorized;
    
    // Add referral to patient
    patient.referrals.push(req.body);
    patient.updatedBy = req.user.mongoId;
    await patient.save();
    
    // Log the referral addition
    await createAuditLog({
      action: 'PATIENT_REFERRAL_ADDED',
      performedBy: req.user.mongoId,
      resourceType: 'PATIENT',
      resourceId: patient._id,
      details: { 
        patientId: patient._id, 
        patientName: `${patient.firstName} ${patient.lastName}`,
        referringProvider: req.body.referringProvider,
        authorizedVisits: req.body.visitCount.authorized
      }
    });
    
    return res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error adding referral:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Add alert to patient
 */
export const addAlert = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Patient not found'
      });
    }
    
    // Add creator info
    req.body.createdBy = req.user.mongoId;
    
    // Add alert to patient
    patient.alerts.push(req.body);
    patient.updatedBy = req.user.mongoId;
    await patient.save();
    
    // Log the alert addition
    await createAuditLog({
      action: 'PATIENT_ALERT_ADDED',
      performedBy: req.user.mongoId,
      resourceType: 'PATIENT',
      resourceId: patient._id,
      details: { 
        patientId: patient._id, 
        patientName: `${patient.firstName} ${patient.lastName}`,
        alertType: req.body.type,
        alertSeverity: req.body.severity
      }
    });
    
    return res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error adding alert:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};