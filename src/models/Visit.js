import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    index: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  chiefComplaint: {
    type: String,
    required: true
  },
  subjective: String,
  objective: String,
  assessment: String,
  plan: String,
  diagnosisCodes: [{
    code: String,
    description: String
  }],
  procedureCodes: [{
    code: String,
    description: String,
    fee: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  vitals: {
    bloodPressure: String,
    heartRate: Number,
    respiratoryRate: Number,
    temperature: Number,
    height: Number,
    weight: Number,
    painLevel: {
      type: Number,
      min: 0,
      max: 10
    }
  },
  treatmentNotes: String,
  followUpRecommendation: {
    recommended: {
      type: Boolean,
      default: true
    },
    timeframe: String, // e.g., "1 week", "2 days"
    instructions: String
  },
  signatures: {
    patient: {
      signature: String,
      timestamp: Date
    },
    provider: {
      signature: String,
      timestamp: Date
    }
  },
  status: {
    type: String,
    enum: ['DRAFT', 'COMPLETED', 'BILLED', 'PAID'],
    default: 'DRAFT'
  },
  billing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billing'
  },
  referralUsed: {
    type: Boolean,
    default: false
  },
  packageUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create indexes for frequently queried fields
visitSchema.index({ patient: 1, date: -1 });
visitSchema.index({ provider: 1, date: -1 });
visitSchema.index({ status: 1 });
visitSchema.index({ 'procedureCodes.code': 1 });

const Visit = mongoose.model('Visit', visitSchema);

export default Visit;