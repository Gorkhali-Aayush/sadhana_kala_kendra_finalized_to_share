import db from "../config/db.js";

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
    // silent fail — logging must never break main flow
  }
};