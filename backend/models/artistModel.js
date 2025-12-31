import db from "../config/db.js";

class ArtistModel {

  // Get all artists
  static async getAll() {
    const [rows] = await db.query(
      `SELECT * FROM Artists ORDER BY artist_id ASC`
    );
    return rows;
  }

  // Get artist by ID
  static async getById(artist_id) {
    const [rows] = await db.query(
      `SELECT * FROM Artists WHERE artist_id = ?`,
      [artist_id]
    );
    return rows[0];
  }

  // Create new artist
  static async create({ full_name, bio, profile_image }) {
    const [result] = await db.query(
      `INSERT INTO Artists (full_name, bio, profile_image) VALUES (?, ?, ?)`,
      [full_name, bio, profile_image]
    );
    return result.insertId;
  }

  // Update artist
  static async update(artist_id, { full_name, bio, profile_image }) {
    const fields = [];
    const values = [];

    if (full_name !== undefined) {
      fields.push("full_name = ?");
      values.push(full_name);
    }

    if (bio !== undefined) {
      fields.push("bio = ?");
      values.push(bio);
    }

    // Only update if a **new file** was uploaded
    if (profile_image !== null) {
      fields.push("profile_image = ?");
      values.push(profile_image);
    }

    if (fields.length === 0) return;

    const query = `UPDATE Artists SET ${fields.join(", ")} WHERE artist_id = ?`;
    values.push(artist_id);

    await db.query(query, values);
  }

  // Delete artist
  static async delete(artist_id) {
    await db.query(
      `DELETE FROM Artists WHERE artist_id = ?`,
      [artist_id]
    );
  }

}

export default ArtistModel;