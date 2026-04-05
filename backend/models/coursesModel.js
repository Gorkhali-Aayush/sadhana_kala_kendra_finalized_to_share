import db from "../config/db.js";
import { logger } from "../utils/logger.js";

class CoursesModel {
    static async getOffers(courseId) {
        try {
            const [rows] = await db.query(
                `SELECT * FROM Offers
                WHERE course_id = ? AND is_active = 1
                AND (valid_from IS NULL OR valid_from <= CURDATE())
                AND (valid_to IS NULL OR valid_to >= CURDATE())
                ORDER BY created_at DESC`,
                [courseId]
            );
            return rows || [];
        } catch (error) {
            // Log error but don't crash - return empty array as fallback
            logger.error(`Error fetching offers for course ${courseId}: ${error.message}`);
            return [];
        }
    }

    static async getAll() {
        try {
            const [courses] = await db.query(`
                SELECT 
                    c.course_id,
                    c.course_name,
                    c.slug,
                    c.description,
                    c.image_url,
                    c.level,
                    c.price,
                    c.teacher_id,
                    c.seo_title,
                    c.seo_description,
                    c.seo_keywords,
                    c.display_order,
                    c.created_at,
                    c.updated_at,
                    t.full_name AS teacher_name,
                    COALESCE(
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'schedule_id', cs.schedule_id,
                                'class_day', cs.class_day,
                                'start_time', TIME_FORMAT(cs.start_time, '%H:%i:%s'),
                                'end_time', TIME_FORMAT(cs.end_time, '%H:%i:%s'),
                                'teacher_id', cs.teacher_id,
                                'teacher_name', st.full_name
                            )
                        ),
                        JSON_ARRAY()
                    ) AS schedules
                FROM Courses c
                LEFT JOIN Teachers t ON c.teacher_id = t.teacher_id
                LEFT JOIN Class_Schedule cs ON c.course_id = cs.course_id
                LEFT JOIN Teachers st ON cs.teacher_id = st.teacher_id
                GROUP BY c.course_id
                ORDER BY c.display_order ASC, c.created_at ASC
            `);

            // Use Promise.allSettled to handle partial failures gracefully
            const results = await Promise.allSettled(courses.map(async course => {
                try {
                    // Safely parse schedules JSON with error handling
                    let schedules = [];
                    if (course.schedules) {
                        try {
                            schedules = typeof course.schedules === 'string' 
                                ? JSON.parse(course.schedules) 
                                : course.schedules;
                        } catch (parseError) {
                            logger.warn(`Failed to parse schedules for course ${course.course_id}: ${parseError.message}`);
                            schedules = [];
                        }
                    }
                    
                    // Fetch offers for this course (already has error handling)
                    const offers = await this.getOffers(course.course_id);
                    
                    return {
                        ...course,
                        schedules,
                        offers
                    };
                } catch (courseError) {
                    logger.error(`Error processing course ${course.course_id}: ${courseError.message}`);
                    // Return course with minimal data rather than failing entire request
                    return {
                        ...course,
                        schedules: [],
                        offers: []
                    };
                }
            }));

            // Filter out any failed promises and map results
            return results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
        } catch (error) {
            logger.error(`Error fetching all courses: ${error.message}`);
            throw new Error(`Error fetching all courses: ${error.message}`);
        }
    }

    static async getById(course_id) {
        try {
            const [courses] = await db.query(`
                SELECT 
                    c.*,
                    t.full_name AS teacher_name,
                    COALESCE(
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'schedule_id', cs.schedule_id,
                                'class_day', cs.class_day,
                                'start_time', TIME_FORMAT(cs.start_time, '%H:%i:%s'),
                                'end_time', TIME_FORMAT(cs.end_time, '%H:%i:%s'),
                                'teacher_id', cs.teacher_id,
                                'teacher_name', st.full_name
                            )
                        ),
                        JSON_ARRAY()
                    ) AS schedules
                FROM Courses c
                LEFT JOIN Teachers t ON c.teacher_id = t.teacher_id
                LEFT JOIN Class_Schedule cs ON c.course_id = cs.course_id
                LEFT JOIN Teachers st ON cs.teacher_id = st.teacher_id
                WHERE c.course_id = ?
                GROUP BY c.course_id
            `, [course_id]);

            const course = courses[0];
            if (!course) return null;

            // Safely parse schedules JSON with error handling
            try {
                course.schedules = typeof course.schedules === 'string' 
                    ? JSON.parse(course.schedules) 
                    : course.schedules || [];
            } catch (parseError) {
                logger.warn(`Failed to parse schedules for course ${course_id}: ${parseError.message}`);
                course.schedules = [];
            }

            // Get offers (already has error handling)
            const offers = await this.getOffers(course_id);
            course.offers = offers;

            return course;
        } catch (error) {
            logger.error(`Error fetching course by ID ${course_id}: ${error.message}`);
            throw new Error(`Error fetching course by ID: ${error.message}`);
        }
    }

    static async getBySlug(slug) {
        try {
            const [courses] = await db.query(`
                SELECT 
                    c.*,
                    t.full_name AS teacher_name,
                    COALESCE(
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'schedule_id', cs.schedule_id,
                                'class_day', cs.class_day,
                                'start_time', TIME_FORMAT(cs.start_time, '%H:%i:%s'),
                                'end_time', TIME_FORMAT(cs.end_time, '%H:%i:%s'),
                                'teacher_id', cs.teacher_id,
                                'teacher_name', st.full_name
                            )
                        ),
                        JSON_ARRAY()
                    ) AS schedules
                FROM Courses c
                LEFT JOIN Teachers t ON c.teacher_id = t.teacher_id
                LEFT JOIN Class_Schedule cs ON c.course_id = cs.course_id
                LEFT JOIN Teachers st ON cs.teacher_id = st.teacher_id
                WHERE c.slug = ?
                GROUP BY c.course_id
            `, [slug]);

            const course = courses[0];
            if (!course) return null;

            // Safely parse schedules JSON with error handling
            try {
                course.schedules = typeof course.schedules === 'string' 
                    ? JSON.parse(course.schedules) 
                    : course.schedules || [];
            } catch (parseError) {
                logger.warn(`Failed to parse schedules for course slug ${slug}: ${parseError.message}`);
                course.schedules = [];
            }

            // Get offers (already has error handling)
            const offers = await this.getOffers(course.course_id);
            course.offers = offers;

            return course;
        } catch (error) {
            logger.error(`Error fetching course by slug ${slug}: ${error.message}`);
            throw new Error(`Error fetching course by slug: ${error.message}`);
        }
    }

    static async create({ title, description, level, price, teacher_name, image_url, schedules, slug, seo_title, seo_description, seo_keywords, display_order }) {
        if (!title?.trim()) throw new Error("Course title is required");
        
        const connection = await db.getConnection(); // 🔧 Start transaction
        try {
            await connection.beginTransaction(); // 🔧 Begin transaction

            const [teacherRows] = await connection.query(
                `SELECT teacher_id FROM Teachers WHERE full_name = ?`,
                [teacher_name]
            );
            const teacher_id = teacherRows[0]?.teacher_id || null;

            const [result] = await connection.query(
                `INSERT INTO Courses (course_name, slug, description, level, price, teacher_id, image_url, seo_title, seo_description, seo_keywords, display_order)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    title,
                    slug,
                    description || null,
                    level || null,
                    price !== undefined && price !== null && price !== "" ? Number(price) : null,
                    teacher_id,
                    image_url || null,
                    seo_title || null,
                    seo_description || null,
                    seo_keywords || null,
                    display_order || 0,
                ]
            );

            const course_id = result.insertId;

            if (Array.isArray(schedules)) {
                for (let s of schedules) {
                    if (s.class_day && s.start_time && s.end_time) {
                        let schedule_teacher_id = s.teacher_id || null;
                        if (s.teacher_name && !s.teacher_id) {
                            const [scheduleTeacherRows] = await connection.query(
                                `SELECT teacher_id FROM Teachers WHERE full_name = ?`,
                                [s.teacher_name]
                            );
                            schedule_teacher_id = scheduleTeacherRows[0]?.teacher_id || null;
                        }

                        await connection.query(
                            `INSERT INTO Class_Schedule (course_id, teacher_id, class_day, start_time, end_time)
                             VALUES (?, ?, ?, ?, ?)`,
                            [course_id, schedule_teacher_id, s.class_day, s.start_time, s.end_time]
                        );
                    }
                }
            }

            await connection.commit(); // 🔧 Commit transaction
            return course_id;
        } catch (err) {
            await connection.rollback(); // 🔧 Rollback on error
            throw err;
        } finally {
            connection.release(); // 🔧 Release connection
        }
    }

    static async update(course_id, { title, description, level, price, teacher_name, image_url, schedules, slug, seo_title, seo_description, seo_keywords, display_order }) {
        if (!course_id) throw new Error("Course ID is required for update.");
        if (!title?.trim()) throw new Error("Course title is required");

        const connection = await db.getConnection(); // 🔧 Start transaction
        try {
            await connection.beginTransaction(); // 🔧 Begin transaction

            const [teacherRows] = await connection.query(
                `SELECT teacher_id FROM Teachers WHERE full_name = ?`,
                [teacher_name]
            );
            const teacher_id = teacherRows[0]?.teacher_id || null;

            let oldImagePath = null;
            let updateImageClause = '';
            let updateDisplayOrderClause = '';
            const params = [
                title,
                slug,
                description || null,
                level || null,
                price !== undefined && price !== null && price !== "" ? Number(price) : null,
                teacher_id,
                seo_title || null,
                seo_description || null,
                seo_keywords || null,
            ];

            if (image_url !== undefined) {
                const [old] = await connection.query(`SELECT image_url FROM Courses WHERE course_id = ?`, [course_id]);
                oldImagePath = old[0]?.image_url || null;
                
                updateImageClause = ', image_url = ?';
                params.push(image_url);
            }

            if (display_order !== undefined) {
                updateDisplayOrderClause = ', display_order = ?';
                params.push(display_order);
            }

            params.push(course_id);

            await connection.query(
                `UPDATE Courses
                 SET course_name = ?, slug = ?, description = ?, level = ?, price = ?, teacher_id = ?, seo_title = ?, seo_description = ?, seo_keywords = ? ${updateImageClause} ${updateDisplayOrderClause}
                 WHERE course_id = ?`,
                params
            );

            await connection.query(`DELETE FROM Class_Schedule WHERE course_id = ?`, [course_id]);

            if (Array.isArray(schedules)) {
                for (let s of schedules) {
                    if (s.class_day && s.start_time && s.end_time) {
                        let schedule_teacher_id = s.teacher_id || null;
                        if (s.teacher_name && !s.teacher_id) {
                            const [scheduleTeacherRows] = await connection.query(
                                `SELECT teacher_id FROM Teachers WHERE full_name = ?`,
                                [s.teacher_name]
                            );
                            schedule_teacher_id = scheduleTeacherRows[0]?.teacher_id || null;
                        }

                        await connection.query(
                            `INSERT INTO Class_Schedule (course_id, teacher_id, class_day, start_time, end_time)
                             VALUES (?, ?, ?, ?, ?)`,
                            [course_id, schedule_teacher_id, s.class_day, s.start_time, s.end_time]
                        );
                    }
                }
            }

            await connection.commit(); // 🔧 Commit transaction
            return oldImagePath;
        } catch (err) {
            await connection.rollback(); // 🔧 Rollback on error
            throw err;
        } finally {
            connection.release(); // 🔧 Release connection
        }
    }

    static async delete(course_id) {
        if (!course_id) throw new Error("Course ID is required for deletion.");
        
        const [rows] = await db.query(`SELECT image_url FROM Courses WHERE course_id = ?`, [course_id]);
        const imagePath = rows[0]?.image_url || null;

        await db.query(`DELETE FROM Class_Schedule WHERE course_id = ?`, [course_id]);
        
        await db.query(`DELETE FROM Courses WHERE course_id = ?`, [course_id]);

        return imagePath; 
    }
}

export default CoursesModel;
