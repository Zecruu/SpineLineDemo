import AuditLog from '../models/AuditLog.js';

/**
 * Create an audit log entry
 * @param {Object} logData - The audit log data
 * @param {string} logData.action - The action performed (e.g., 'USER_CREATED', 'PATIENT_UPDATED')
 * @param {string} logData.performedBy - The ID of the user who performed the action
 * @param {Object} logData.details - Additional details about the action
 * @param {string} [logData.resourceType] - The type of resource affected (e.g., 'USER', 'PATIENT')
 * @param {string} [logData.resourceId] - The ID of the resource affected
 */
export async function createAuditLog(logData) {
  try {
    const auditLog = new AuditLog({
      action: logData.action,
      performedBy: logData.performedBy,
      details: logData.details || {},
      resourceType: logData.resourceType,
      resourceId: logData.resourceId,
      timestamp: new Date()
    });
    
    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw the error to prevent disrupting the main application flow
    // But in a production environment, you might want to implement a retry mechanism
    // or queue failed audit logs for later processing
  }
}