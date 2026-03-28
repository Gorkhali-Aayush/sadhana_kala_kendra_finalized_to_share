import db from "../config/db.js";

class ActivitiesModel {
    static async getAll() {
        const [rows] = await db.query(
            `SELECT activity_id, title, description, video_url, display_order, created_at, updated_at
             FROM activities
             ORDER BY display_order ASC, created_at DESC, activity_id DESC`
        );
        return rows;
    }

    static async getById(activityId) {
        const [rows] = await db.query(
            `SELECT activity_id, title, description, video_url, display_order, created_at, updated_at
             FROM activities
             WHERE activity_id = ?`,
            [activityId]
        );
        return rows[0] || null;
    }

    static async create({ title, description, video_url, display_order }) {
        const [result] = await db.query(
            `INSERT INTO activities (title, description, video_url, display_order)
             VALUES (?, ?, ?, ?)`,
            [title, description || null, video_url, display_order || 0]
        );
        return result.insertId;
    }

    static async update(activityId, { title, description, video_url, display_order }) {
        const fields = [];
        const values = [];

        if (title !== undefined) {
            fields.push("title = ?");
            values.push(title);
        }

        if (description !== undefined) {
            fields.push("description = ?");
            values.push(description);
        }

        if (video_url !== undefined) {
            fields.push("video_url = ?");
            values.push(video_url);
        }

        if (display_order !== undefined) {
            fields.push("display_order = ?");
            values.push(display_order);
        }

        if (fields.length === 0) return;

        values.push(activityId);
        await db.query(
            `UPDATE activities SET ${fields.join(", ")} WHERE activity_id = ?`,
            values
        );
    }

    static async delete(activityId) {
        await db.query(
            `DELETE FROM activities WHERE activity_id = ?`,
            [activityId]
        );
    }
}

export default ActivitiesModel;
