import db from "../config/db.js";

class ActivitiesModel {
    static async getAll() {
        const [rows] = await db.query(
            `SELECT activity_id, title, slug, description, video_url, seo_title, seo_description, seo_keywords, display_order, created_at, updated_at
             FROM activities
             ORDER BY display_order ASC, created_at DESC, activity_id DESC`
        );
        return rows;
    }

    static async getById(activityId) {
        const [rows] = await db.query(
            `SELECT activity_id, title, slug, description, video_url, seo_title, seo_description, seo_keywords, display_order, created_at, updated_at
             FROM activities
             WHERE activity_id = ?`,
            [activityId]
        );
        return rows[0] || null;
    }

    static async getBySlug(slug) {
        const [rows] = await db.query(
            `SELECT activity_id, title, slug, description, video_url, seo_title, seo_description, seo_keywords, display_order, created_at, updated_at
             FROM activities
             WHERE slug = ? OR LOWER(REPLACE(title, ' ', '-')) = LOWER(?)
             LIMIT 1`,
            [slug, slug]
        );
        return rows[0] || null;
    }

    static async create({ title, slug, description, video_url, seo_title, seo_description, seo_keywords, display_order }) {
        const [result] = await db.query(
            `INSERT INTO activities (title, slug, description, video_url, seo_title, seo_description, seo_keywords, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, slug || null, description || null, video_url, seo_title || null, seo_description || null, seo_keywords || null, display_order || 0]
        );
        return result.insertId;
    }

    static async update(activityId, { title, slug, description, video_url, seo_title, seo_description, seo_keywords, display_order }) {
        const fields = [];
        const values = [];

        if (title !== undefined) {
            fields.push("title = ?");
            values.push(title);
        }

        if (slug !== undefined) {
            fields.push("slug = ?");
            values.push(slug);
        }

        if (description !== undefined) {
            fields.push("description = ?");
            values.push(description);
        }

        if (video_url !== undefined) {
            fields.push("video_url = ?");
            values.push(video_url);
        }

        if (seo_title !== undefined) {
            fields.push("seo_title = ?");
            values.push(seo_title);
        }

        if (seo_description !== undefined) {
            fields.push("seo_description = ?");
            values.push(seo_description);
        }

        if (seo_keywords !== undefined) {
            fields.push("seo_keywords = ?");
            values.push(seo_keywords);
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
