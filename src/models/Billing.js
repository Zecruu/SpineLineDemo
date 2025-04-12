import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['CASH', 'CREDIT_CARD', 'CHECK', 'INSURANCE', 'PACKAGE', 'OTHER'],
    required: true
  },
  reference: String, // Transaction ID, check number, etc.
  date: {
    type: Date,
    default: Date.now
  },
  notes: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const insuranceClaimSchema = new mongoose.Schema({
  insuranceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  claimNumber: String,
  submissionDate: Date,
  status: {
    type: String,
    enum: ['PENDING', 'SUBMITTED', 'PROCESSING', 'PAID', 'DENIED', 'APPEALED'],
    default: 'PENDING'
  },
  amountBilled: Number,
  amountApproved: Number,
  amountPaid: Number,
  denialReason: String,
  notes: String,
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responseDate: Date
}, {
  timestamps: true
});

const billingSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  visit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit',
    required: true,
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  items: [{
    procedureCode: {
      type: String,
      required: true
    },
    description: String,
    quantity: {
      type: Number,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    packageApplied: {
      type: Boolean,
      default: false
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package'
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    amount: Number,
    reason: String
  },
  tax: Number,
  total: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    required: true
  },
  payments: [paymentSchema],
  insuranceClaims: [insuranceClaimSchema],
  status: {
    type: String,
    enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  dueDate: Date,
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
billingSchema.index({ patient: 1, date: -1 });
billingSchema.index({ status: 1, dueDate: 1 });
billingSchema.index({ 'items.procedureCode': 1 });

const Billing = mongoose.model('Billing', billingSchema);

export default Billing;