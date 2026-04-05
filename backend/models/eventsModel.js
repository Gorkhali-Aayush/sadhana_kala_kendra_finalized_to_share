import db from "../config/db.js";

class EventsModel {
    static async getAll() {
        const [rows] = await db.query(
            `SELECT * FROM Events ORDER BY display_order ASC, event_date DESC, event_time ASC`
        );
        return rows;
    }

    // Get events by category
    static async getByCategory(category) {
        const [rows] = await db.query(
            `SELECT * FROM Events WHERE category = ? ORDER BY display_order ASC, event_date DESC, event_time ASC`,
            [category]
        );
        return rows;
    }

    static async getById(event_id) {
        const [rows] = await db.query(
            `SELECT * FROM Events WHERE event_id = ?`,
            [event_id]
        );
        return rows[0];
    }

    static async getBySlug(slug) {
        const [rows] = await db.query(
            `SELECT * FROM Events WHERE slug = ?`,
            [slug]
        );
        return rows[0] || null;
    }
    
    static async create({ event_name, slug, description, rich_content, event_date, event_time, venue, organized_by, category, seo_title, seo_description, seo_keywords, display_order }) { 
        const [result] = await db.query(
            `INSERT INTO Events (event_name, slug, description, rich_content, event_date, event_time, venue, organized_by, category, seo_title, seo_description, seo_keywords, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                event_name,
                slug,
                description,
                rich_content || null,
                event_date,
                event_time,
                venue,
                organized_by,
                category || 'upcoming',
                seo_title || null,
                seo_description || null,
                seo_keywords || null,
                display_order ?? 0,
            ]
        );
        return result.insertId;
    }

    static async update(event_id, { event_name, slug, description, rich_content, event_date, event_time, venue, organized_by, category, seo_title, seo_description, seo_keywords, display_order }) {
        const fields = [];
        const values = [];

        if (event_name !== undefined) { fields.push("event_name = ?"); values.push(event_name); }
        if (slug !== undefined) { fields.push("slug = ?"); values.push(slug); }
        if (description !== undefined) { fields.push("description = ?"); values.push(description); }
        if (rich_content !== undefined) { fields.push("rich_content = ?"); values.push(rich_content); }
        if (event_date !== undefined) { fields.push("event_date = ?"); values.push(event_date); }
        if (event_time !== undefined) { fields.push("event_time = ?"); values.push(event_time); }
        if (venue !== undefined) { fields.push("venue = ?"); values.push(venue); }
        if (organized_by !== undefined) { fields.push("organized_by = ?"); values.push(organized_by); }
        if (category !== undefined) { fields.push("category = ?"); values.push(category); }
        if (seo_title !== undefined) { fields.push("seo_title = ?"); values.push(seo_title); }
        if (seo_description !== undefined) { fields.push("seo_description = ?"); values.push(seo_description); }
        if (seo_keywords !== undefined) { fields.push("seo_keywords = ?"); values.push(seo_keywords); }
        if (display_order !== undefined) { fields.push("display_order = ?"); values.push(display_order); }
        
        if (fields.length === 0) return;

        const query = `UPDATE Events SET ${fields.join(', ')} WHERE event_id = ?`;
        values.push(event_id);

        await db.query(query, values);
    }

    static async delete(event_id) {
        await db.query(
            `DELETE FROM Events WHERE event_id = ?`,
            [event_id]
        );
    }

    // ===== PROGRAMS =====
    static async getAllPrograms() {
        const [rows] = await db.query("SELECT * FROM Programs ORDER BY display_order ASC, program_date DESC");
        return rows;
    }

    static async getProgramById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Programs WHERE program_id = ?",
            [id]
        );
        return rows[0];
    }

    static async getProgramBySlug(slug) {
        const [rows] = await db.query(
            "SELECT * FROM Programs WHERE slug = ?",
            [slug]
        );
        return rows[0] || null;
    }

    static async createProgram(data) {
        const { program_date, title, slug, rich_content, image_url, seo_title, seo_description, seo_keywords, display_order } = data;
        const [result] = await db.query(
            "INSERT INTO Programs (program_date, title, slug, rich_content, image_url, seo_title, seo_description, seo_keywords, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                program_date,
                title,
                slug,
                rich_content || null,
                image_url || null,
                seo_title || null,
                seo_description || null,
                seo_keywords || null,
                display_order ?? 0,
            ]
        );
        return result.insertId;
    }

    static async updateProgram(id, data) {
        const { program_date, title, slug, rich_content, image_url, seo_title, seo_description, seo_keywords, display_order } = data;
        
        const updates = [];
        const values = [];
        
        if (program_date !== undefined) {
            updates.push('program_date = ?');
            values.push(program_date);
        }
        if (title !== undefined) {
            updates.push('title = ?');
            values.push(title);
        }
        if (slug !== undefined) {
            updates.push('slug = ?');
            values.push(slug);
        }
        if (rich_content !== undefined) {
            updates.push('rich_content = ?');
            values.push(rich_content || null);
        }
        if (seo_title !== undefined) {
            updates.push('seo_title = ?');
            values.push(seo_title || null);
        }
        if (seo_description !== undefined) {
            updates.push('seo_description = ?');
            values.push(seo_description || null);
        }
        if (seo_keywords !== undefined) {
            updates.push('seo_keywords = ?');
            values.push(seo_keywords || null);
        }
        if (image_url !== undefined) {
            updates.push('image_url = ?');
            values.push(image_url || null);
        }
        if (display_order !== undefined) {
            updates.push('display_order = ?');
            values.push(display_order);
        }
        
        if (updates.length === 0) return;
        
        values.push(id);
        
        const [result] = await db.query(
            `UPDATE Programs SET ${updates.join(', ')} WHERE program_id = ?`,
            values
        );
        
        if (result.affectedRows === 0) throw new Error("Program not found.");
    }

    static async deleteProgram(id) {
        const [result] = await db.query(
            "DELETE FROM Programs WHERE program_id = ?",
            [id]
        );
        if (result.affectedRows === 0) throw new Error("Program not found.");
    }

    // ===== PROGRAM RESOURCES =====
    static async getProgramResources(program_id) {
        try {
            const [rows] = await db.query(
                `SELECT resource_id, program_id, resource_type, resource_url, caption, sort_order
                 FROM Program_Resources
                 WHERE program_id = ?
                 ORDER BY sort_order ASC, resource_id ASC`,
                [program_id]
            );
            return rows;
        } catch (err) {
            if (err.code === "ER_BAD_FIELD_ERROR") {
                const [rows] = await db.query(
                    `SELECT resource_id, program_id, resource_type, resource_url
                     FROM Program_Resources
                     WHERE program_id = ?
                     ORDER BY resource_id ASC`,
                    [program_id]
                );
                return rows.map((row, index) => ({
                    ...row,
                    caption: null,
                    sort_order: index + 1,
                }));
            }

            // Allow frontend details page to load even before Program_Resources migration is applied.
            if (err.code === "ER_NO_SUCH_TABLE") {
                return [];
            }
            throw err;
        }
    }

    static async replaceProgramResources(program_id, resources = []) {
        await db.query(`DELETE FROM Program_Resources WHERE program_id = ?`, [program_id]);

        if (!Array.isArray(resources) || resources.length === 0) {
            return;
        }

        const placeholders = resources.map(() => "(?, ?, ?, ?, ?)").join(", ");
        const values = [];

        resources.forEach((item, index) => {
            values.push(
                program_id,
                item.resource_type,
                item.resource_url,
                item.caption || null,
                item.sort_order ?? index + 1
            );
        });

        try {
            await db.query(
                `INSERT INTO Program_Resources (program_id, resource_type, resource_url, caption, sort_order)
                 VALUES ${placeholders}`,
                values
            );
        } catch (err) {
            throw err;
        }
    }
}

export default EventsModel;