import mongoose from 'mongoose';

const insuranceSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    trim: true
  },
  policyNumber: {
    type: String,
    required: true,
    trim: true
  },
  groupNumber: String,
  primaryInsured: {
    name: String,
    relationship: String,
    dateOfBirth: Date
  },
  coverageStartDate: Date,
  coverageEndDate: Date,
  verificationDate: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const referralSchema = new mongoose.Schema({
  referringProvider: String,
  referralDate: Date,
  expirationDate: Date,
  visitCount: {
    authorized: Number,
    used: {
      type: Number,
      default: 0
    },
    remaining: Number
  },
  diagnosis: [String],
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['MEDICAL', 'BILLING', 'ADMINISTRATIVE', 'OTHER'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expirationDate: Date
}, {
  timestamps: true
});

const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
    required: true
  },
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: String,
    alternatePhone: String,
    preferredContact: {
      type: String,
      enum: ['EMAIL', 'PHONE', 'TEXT'],
      default: 'PHONE'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    }
  },
  insurance: [insuranceSchema],
  referrals: [referralSchema],
  alerts: [alertSchema],
  packages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  }],
  medicalHistory: {
    conditions: [String],
    medications: [String],
    allergies: [String],
    surgeries: [String],
    familyHistory: String,
    notes: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'DISCHARGED'],
    default: 'ACTIVE'
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
  notes: String
}, {
  timestamps: true
});

// Virtual for full name
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age calculation
patientSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Create indexes for frequently queried fields
patientSchema.index({ lastName: 1, firstName: 1 });
patientSchema.index({ 'contactInfo.email': 1 });
patientSchema.index({ 'contactInfo.phone': 1 });
patientSchema.index({ dateOfBirth: 1 });
patientSchema.index({ status: 1 });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;