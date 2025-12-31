import db from "../config/db.js";

class EventsModel {
    static async getAll() {
        const [rows] = await db.query(
            `SELECT * FROM Events ORDER BY event_date DESC, event_time ASC`
        );
        return rows;
    }

    // Get events by category
    static async getByCategory(category) {
        const [rows] = await db.query(
            `SELECT * FROM Events WHERE category = ? ORDER BY event_date DESC, event_time ASC`,
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
    
    static async create({ event_name, description, event_date, event_time, venue, organized_by, category }) { 
        const [result] = await db.query(
            `INSERT INTO Events (event_name, description, event_date, event_time, venue, organized_by, category)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [event_name, description, event_date, event_time, venue, organized_by, category || 'upcoming']
        );
        return result.insertId;
    }

    static async update(event_id, { event_name, description, event_date, event_time, venue, organized_by, category }) {
        const fields = [];
        const values = [];

        if (event_name !== undefined) { fields.push("event_name = ?"); values.push(event_name); }
        if (description !== undefined) { fields.push("description = ?"); values.push(description); }
        if (event_date !== undefined) { fields.push("event_date = ?"); values.push(event_date); }
        if (event_time !== undefined) { fields.push("event_time = ?"); values.push(event_time); }
        if (venue !== undefined) { fields.push("venue = ?"); values.push(venue); }
        if (organized_by !== undefined) { fields.push("organized_by = ?"); values.push(organized_by); }
        if (category !== undefined) { fields.push("category = ?"); values.push(category); }
        
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
}

export default EventsModel;