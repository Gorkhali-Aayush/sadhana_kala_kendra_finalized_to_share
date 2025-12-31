import db from "../config/db.js";

class AdminModel {
    static async create(username, hashedPassword) {
        const [result] = await db.query(
            `INSERT INTO admin_user (username, password) VALUES (?, ?)`,
            [username, hashedPassword]
        );
        return result.insertId;
    }

    static async findByUsername(username) {
        const [rows] = await db.query(
            `SELECT admin_id, username, password FROM admin_user WHERE username = ?`,
            [username]
        );
        return rows[0];
    }

    static async findById(admin_id) {
        const [rows] = await db.query(
            `SELECT admin_id, username FROM admin_user WHERE admin_id = ?`,
            [admin_id]
        );
        return rows[0];
    }

    static async getHashedPassword(admin_id) {
        const [rows] = await db.query(
            `SELECT password FROM admin_user WHERE admin_id = ?`,
            [admin_id]
        );
        return rows[0] ? rows[0].password : null;
    }

    static async updatePassword(admin_id, hashedPassword) {
        const [result] = await db.query(
            `UPDATE admin_user SET password = ?, created_at = CURRENT_TIMESTAMP WHERE admin_id = ?`,
            [hashedPassword, admin_id]
        );
        return result.affectedRows > 0;
    }
}

export default AdminModel;