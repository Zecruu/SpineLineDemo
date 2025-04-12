import Appointment from '../models/Appointment.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * Get all appointments
 */
export const getAllAppointments = async (req, res) => {
  try {
    // Add filtering
    const filter = {};
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.dateTime = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.date) {
      // Filter by specific date
      const date = new Date(req.query.date);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      filter.dateTime = {
        $gte: date,
        $lt: nextDay
      };
    }
    
    // Filter by provider
    if (req.query.provider) {
      filter.provider = req.query.provider;
    }
    
    // Filter by patient
    if (req.query.patient) {
      filter.patient = req.query.patient;
    }
    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by type
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName dateOfBirth contactInfo.phone')
      .populate('provider', 'fullName')
      .populate('createdBy', 'fullName')
      .sort({ dateTime: 1 });
    
    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth contactInfo')
      .populate('provider', 'fullName')
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName')
      .populate('cancelledBy', 'fullName');
    
    if (!appointment) {
      return res.status(404).json({
        error: true,
        message: 'Appointment not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error getting appointment:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Create new appointment
 */
export const createAppointment = async (req, res) => {
  try {
    // Add the user who created the appointment
    req.body.createdBy = req.user.mongoId;
    
    // Calculate end time based on duration
    const startTime = new Date(req.body.dateTime);
    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + (req.body.duration || 30));
    req.body.endTime = endTime;
    
    // Check for scheduling conflicts
    const conflictingAppointment = await Appointment.findOne({
      provider: req.body.provider,
      $or: [
        // New appointment starts during an existing appointment
        {
          dateTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        // New appointment ends during an existing appointment
        {
          dateTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        // New appointment completely contains an existing appointment
        {
          dateTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ],
      status: { $nin: ['CANCELLED', 'NO_SHOW'] }
    });
    
    if (conflictingAppointment) {
      return res.status(400).json({
        error: true,
        message: 'Scheduling conflict detected. The provider already has an appointment during this time.'
      });
    }
    
    const appointment = await Appointment.create(req.body);
    
    // Log the creation
    await createAuditLog({
      action: 'APPOINTMENT_CREATED',
      performedBy: req.user.mongoId,
      resourceType: 'APPOINTMENT',
      resourceId: appointment._id,
      details: { 
        appointmentId: appointment._id, 
        patientId: appointment.patient,
        providerId: appointment.provider,
        dateTime: appointment.dateTime
      }
    });
    
    return res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Update appointment
 */
export const updateAppointment = async (req, res) => {
  try {
    // Add the user who updated the appointment
    req.body.updatedBy = req.user.mongoId;
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        error: true,
        message: 'Appointment not found'
      });
    }
    
    // If updating date/time, check for conflicts
    if (req.body.dateTime) {
      const startTime = new Date(req.body.dateTime);
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + (req.body.duration || appointment.duration || 30));
      req.body.endTime = endTime;
      
      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id }, // Exclude current appointment
        provider: req.body.provider || appointment.provider,
        $or: [
          // New appointment starts during an existing appointment
          {
            dateTime: { $lte: startTime },
            endTime: { $gt: startTime }
          },
          // New appointment ends during an existing appointment
          {
            dateTime: { $lt: endTime },
            endTime: { $gte: endTime }
          },
          // New appointment completely contains an existing appointment
          {
            dateTime: { $gte: startTime },
            endTime: { $lte: endTime }
          }
        ],
        status: { $nin: ['CANCELLED', 'NO_SHOW'] }
      });
      
      if (conflictingAppointment) {
        return res.status(400).json({
          error: true,
          message: 'Scheduling conflict detected. The provider already has an appointment during this time.'
        });
      }
    }
    
    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    // Log the update
    await createAuditLog({
      action: 'APPOINTMENT_UPDATED',
      performedBy: req.user.mongoId,
      resourceType: 'APPOINTMENT',
      resourceId: updatedAppointment._id,
      details: { 
        appointmentId: updatedAppointment._id, 
        patientId: updatedAppointment.patient,
        providerId: updatedAppointment.provider,
        updatedFields: Object.keys(req.body)
      }
    });
    
    return res.status(200).json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Cancel appointment
 */
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        error: true,
        message: 'Appointment not found'
      });
    }
    
    // Update appointment status to cancelled
    appointment.status = 'CANCELLED';
    appointment.cancellationReason = req.body.reason;
    appointment.cancellationDate = new Date();
    appointment.cancelledBy = req.user.mongoId;
    appointment.updatedBy = req.user.mongoId;
    
    await appointment.save();
    
    // Log the cancellation
    await createAuditLog({
      action: 'APPOINTMENT_CANCELLED',
      performedBy: req.user.mongoId,
      resourceType: 'APPOINTMENT',
      resourceId: appointment._id,
      details: { 
        appointmentId: appointment._id, 
        patientId: appointment.patient,
        providerId: appointment.provider,
        reason: req.body.reason
      }
    });
    
    return res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Check in patient for appointment
 */
export const checkInAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        error: true,
        message: 'Appointment not found'
      });
    }
    
    // Update appointment status to checked in
    appointment.status = 'CHECKED_IN';
    appointment.checkinTime = new Date();
    appointment.updatedBy = req.user.mongoId;
    
    await appointment.save();
    
    // Log the check-in
    await createAuditLog({
      action: 'APPOINTMENT_CHECKED_IN',
      performedBy: req.user.mongoId,
      resourceType: 'APPOINTMENT',
      resourceId: appointment._id,
      details: { 
        appointmentId: appointment._id, 
        patientId: appointment.patient,
        providerId: appointment.provider
      }
    });
    
    return res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error checking in appointment:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Mark appointment as completed
 */
export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        error: true,
        message: 'Appointment not found'
      });
    }
    
    // Update appointment status to completed
    appointment.status = 'COMPLETED';
    appointment.completionTime = new Date();
    appointment.updatedBy = req.user.mongoId;
    
    await appointment.save();
    
    // Log the completion
    await createAuditLog({
      action: 'APPOINTMENT_COMPLETED',
      performedBy: req.user.mongoId,
      resourceType: 'APPOINTMENT',
      resourceId: appointment._id,
      details: { 
        appointmentId: appointment._id, 
        patientId: appointment.patient,
        providerId: appointment.provider
      }
    });
    
    return res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};