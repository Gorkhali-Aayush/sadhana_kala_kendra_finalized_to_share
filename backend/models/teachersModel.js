import db from "../config/db.js";

class TeachersModel {
    // Get all teachers
    static async getAll() {
        try {
            const [rows] = await db.query(`
                SELECT teacher_id, full_name, slug, specialization, description, profile_image, seo_title, seo_description, seo_keywords, display_order
                FROM Teachers
                ORDER BY display_order ASC, created_at ASC
            `);
            return rows;
        } catch (err) {
            console.error("Error fetching teachers:", err);
            throw new Error("Failed to fetch teachers");
        }
    }

    // Get a teacher by ID
    static async getById(teacher_id) {
        if (!teacher_id) throw new Error("Teacher ID is required");
        try {
            const [rows] = await db.query(`
                SELECT teacher_id, full_name, slug, specialization, description, profile_image, seo_title, seo_description, seo_keywords, display_order
                FROM Teachers
                WHERE teacher_id = ?
            `, [teacher_id]);
            return rows[0] || null; // Return null if not found, simplifying controller logic
        } catch (err) {
            console.error(`Error fetching teacher ID ${teacher_id}:`, err);
            throw err;
        }
    }

    // Get a teacher by slug (matching full_name or slug column)
    static async getBySlug(slug) {
        if (!slug) throw new Error("Teacher slug is required");
        try {
            const decodedSlug = decodeURIComponent(slug).toLowerCase();
            
            // First, try to find by ID if slug is a number
            if (Number.isFinite(Number(slug))) {
                const [rows] = await db.query(`
                    SELECT teacher_id, full_name, slug, specialization, description, profile_image, seo_title, seo_description, seo_keywords, display_order
                    FROM Teachers
                    WHERE teacher_id = ?
                `, [Number(slug)]);
                if (rows[0]) return rows[0];
            }

            // Try to find by slug column first
            const [slugRows] = await db.query(`
                SELECT teacher_id, full_name, slug, specialization, description, profile_image, seo_title, seo_description, seo_keywords, display_order
                FROM Teachers
                WHERE LOWER(slug) = LOWER(?)
                LIMIT 1
            `, [slug]);
            if (slugRows[0]) return slugRows[0];

            // Get all teachers and match by computed slug
            const [teachers] = await db.query(`
                SELECT teacher_id, full_name, slug, specialization, description, profile_image, seo_title, seo_description, seo_keywords, display_order
                FROM Teachers
                ORDER BY display_order ASC, created_at ASC
            `);

            // Find teacher by matching computed slug (same logic as frontend)
            const teacher = teachers.find(t => {
                const computedSlug = t.full_name
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');
                return computedSlug === decodedSlug;
            });

            return teacher || null;
        } catch (err) {
            console.error(`Error fetching teacher slug ${slug}:`, err);
            throw err;
        }
    }

    // Create a new teacher
    static async create({ full_name, slug, specialization, description, profile_image, seo_title, seo_description, seo_keywords, display_order }) {
        if (!full_name || full_name.trim() === "") {
            throw new Error("full_name is required. Please enter the teacher's full name.");
        }

        try {
            const [result] = await db.query(`
                INSERT INTO Teachers (full_name, slug, specialization, description, profile_image, seo_title, seo_description, seo_keywords, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [full_name, slug || null, specialization, description || null, profile_image, seo_title || null, seo_description || null, seo_keywords || null, display_order || 0]);
            return result.insertId;
        } catch (err) {
            console.error("Error creating teacher:", err);
            if (err.code === "ER_BAD_NULL_ERROR") {
                throw new Error("A required field is missing. Please check your input.");
            }
            throw new Error(err.sqlMessage || "Failed to create teacher");
        }
    }

    // Update an existing teacher
    static async update(teacher_id, { full_name, slug, specialization, description, profile_image, seo_title, seo_description, seo_keywords, display_order }) {
        if (!teacher_id) throw new Error("Teacher ID is required for update");
        if (!full_name || full_name.trim() === "") {
            throw new Error("full_name is required. Please enter the teacher's full name.");
        }

        let query = `
            UPDATE Teachers
            SET full_name = ?, slug = ?, specialization = ?
            ${description !== undefined ? ', description = ?' : ''}
            ${profile_image !== undefined ? ', profile_image = ?' : ''}
            ${seo_title !== undefined ? ', seo_title = ?' : ''}
            ${seo_description !== undefined ? ', seo_description = ?' : ''}
            ${seo_keywords !== undefined ? ', seo_keywords = ?' : ''}
            ${display_order !== undefined ? ', display_order = ?' : ''}
            WHERE teacher_id = ?
        `;

        const params = [full_name, slug || null, specialization];
        if (description !== undefined) {
            params.push(description);
        }
        if (profile_image !== undefined) {
            params.push(profile_image);
        }
        if (seo_title !== undefined) {
            params.push(seo_title);
        }
        if (seo_description !== undefined) {
            params.push(seo_description);
        }
        if (seo_keywords !== undefined) {
            params.push(seo_keywords);
        }
        if (display_order !== undefined) {
            params.push(display_order);
        }
        params.push(teacher_id);

        try {
            // 1. Get the current image path before updating, but ONLY if we are setting a new image (not undefined)
            let oldImagePath = null;
            if (profile_image !== undefined) {
                const oldRecord = await this.getById(teacher_id);
                oldImagePath = oldRecord ? oldRecord.profile_image : null;
            }

            // 2. Perform the update
            const [result] = await db.query(query, params);
            if (result.affectedRows === 0) {
                 throw new Error(`Teacher with ID ${teacher_id} not found.`);
            }

            // 3. Return the old path for the controller to delete the physical file
            return oldImagePath;

        } catch (err) {
            console.error(`Error updating teacher ID ${teacher_id}:`, err);
            if (err.code === "ER_BAD_NULL_ERROR") {
                throw new Error("A required field is missing. Please check your input.");
            }
            throw err.sqlMessage ? new Error(err.sqlMessage) : err;
        }
    }

    // Delete a teacher
    static async delete(teacher_id) {
        if (!teacher_id) throw new Error("Teacher ID is required for deletion");

        try {
            // 1. Get the image path first
            const teacherToDelete = await this.getById(teacher_id);
            if (!teacherToDelete) throw new Error(`Teacher with ID ${teacher_id} not found.`);

            const imagePath = teacherToDelete.profile_image;

            // 2. Delete the record
            await db.query(`
                DELETE FROM Teachers
                WHERE teacher_id = ?
            `, [teacher_id]);
            
            // 3. Return the path for the controller to clean up the physical file
            return imagePath;
        } catch (err) {
            console.error(`Error deleting teacher ID ${teacher_id}:`, err);
            throw err.sqlMessage ? new Error(err.sqlMessage) : err;
        }
    }
}

export default TeachersModel;