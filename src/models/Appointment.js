import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dateTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['INITIAL_CONSULTATION', 'FOLLOW_UP', 'ADJUSTMENT', 'THERAPY', 'EVALUATION', 'OTHER'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED',
    index: true
  },
  reason: {
    type: String,
    required: true
  },
  notes: String,
  checkinTime: Date,
  completionTime: Date,
  duration: {
    type: Number, // Duration in minutes
    default: 30
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM'],
    },
    endDate: Date,
    daysOfWeek: [{
      type: Number, // 0 = Sunday, 1 = Monday, etc.
      min: 0,
      max: 6
    }],
    occurrences: Number
  },
  visitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  cancellationDate: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create indexes for frequently queried fields
appointmentSchema.index({ dateTime: 1, provider: 1 });
appointmentSchema.index({ patient: 1, dateTime: 1 });
appointmentSchema.index({ status: 1, dateTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;