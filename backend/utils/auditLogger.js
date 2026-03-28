import db from "../config/db.js";

/**
 * Log admin actions for audit trail and security monitoring
 * Errors are logged but don't break the main flow
 * @param {Object} params - Audit log parameters
 * @param {number} params.admin_id - Admin user ID
 * @param {string} params.action - Action type (CREATE, UPDATE, DELETE, etc)
 * @param {string} params.entity - Entity type (COURSE, OFFER, etc)
 * @param {number} params.entity_id - ID of affected entity
 * @param {string} params.ip - IP address of request
 */
export const logAdminAction = async ({
  admin_id,
  action,
  entity,
  entity_id,
  ip
}) => {
  try {
    await db.query(
      `INSERT INTO Admin_Audit_Log (admin_id, action, entity, entity_id, ip_address)
       VALUES (?, ?, ?, ?, ?)`,
      [admin_id, action, entity, entity_id, ip]
    );
  } catch (err) {
    // Log error to console/trace but don't break main flow
    console.warn(`[AUDIT LOG WARNING] Failed to log action: ${action} on ${entity} (ID: ${entity_id})`,
      { error: err.message, admin_id, ip }
    );
  }
};