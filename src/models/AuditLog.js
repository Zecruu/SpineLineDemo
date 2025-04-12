import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  resourceType: {
    type: String,
    enum: ['USER', 'PATIENT', 'APPOINTMENT', 'VISIT', 'BILLING', 'PACKAGE', 'SYSTEM'],
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  details: {
    type: Object,
    default: {}
  },
  ipAddress: String,
  userAgent: String
});

// Create indexes for frequently queried fields
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;