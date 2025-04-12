import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  visitCount: {
    type: Number,
    required: true,
    min: 1
  },
  procedureCodes: [{
    code: {
      type: String,
      required: true
    },
    description: String
  }],
  price: {
    type: Number,
    required: true
  },
  validityPeriod: {
    type: Number, // In days
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
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

// Patient package assignment schema
const patientPackageSchema = new mongoose.Schema({
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expirationDate: {
    type: Date,
    required: true
  },
  totalVisits: {
    type: Number,
    required: true
  },
  usedVisits: {
    type: Number,
    default: 0
  },
  remainingVisits: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'FULLY_USED', 'CANCELLED'],
    default: 'ACTIVE',
    index: true
  },
  visits: [{
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visit'
    },
    date: Date,
    procedureCode: String
  }],
  notes: String,
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
patientPackageSchema.index({ patient: 1, status: 1 });
patientPackageSchema.index({ expirationDate: 1, status: 1 });

const Package = mongoose.model('Package', packageSchema);
const PatientPackage = mongoose.model('PatientPackage', patientPackageSchema);

export { Package, PatientPackage };