import db from "../config/db.js";

class GalleryModel {
  static _columns = null;

  static async getColumns() {
    if (GalleryModel._columns) return GalleryModel._columns;

    const [rows] = await db.query("SHOW COLUMNS FROM Gallery");
    GalleryModel._columns = new Set(rows.map((row) => row.Field));
    return GalleryModel._columns;
  }

  static async getImageColumn() {
    const columns = await GalleryModel.getColumns();
    if (columns.has("image_url")) return "image_url";
    if (columns.has("file_url")) return "file_url";
    throw new Error("Gallery table is missing image_url/file_url column");
  }

  static async getCreatedColumn() {
    const columns = await GalleryModel.getColumns();
    if (columns.has("created_at")) return "created_at";
    if (columns.has("upload_date")) return "upload_date";
    return null;
  }

  static async getUpdatedColumn() {
    const columns = await GalleryModel.getColumns();
    if (columns.has("updated_at")) return "updated_at";
    return null;
  }

  static async getAll() {
    const imageColumn = await GalleryModel.getImageColumn();
    const createdColumn = await GalleryModel.getCreatedColumn();
    const updatedColumn = await GalleryModel.getUpdatedColumn();

    const createdSelect = createdColumn ? `${createdColumn} AS created_at` : "NULL AS created_at";
    const updatedSelect = updatedColumn ? `${updatedColumn} AS updated_at` : "NULL AS updated_at";
    const orderBy = createdColumn && updatedColumn 
      ? `display_order ASC, ${updatedColumn} DESC, media_id DESC` 
      : `display_order ASC, media_id DESC`;

    const [rows] = await db.query(
      `SELECT media_id, title, ${imageColumn} AS image_url, display_order, ${createdSelect}, ${updatedSelect}
       FROM Gallery
       WHERE ${imageColumn} IS NOT NULL AND ${imageColumn} <> ''
       ORDER BY ${orderBy}`
    );
    return rows;
  }

  static async getById(mediaId) {
    const imageColumn = await GalleryModel.getImageColumn();
    const createdColumn = await GalleryModel.getCreatedColumn();
    const updatedColumn = await GalleryModel.getUpdatedColumn();

    const createdSelect = createdColumn ? `${createdColumn} AS created_at` : "NULL AS created_at";
    const updatedSelect = updatedColumn ? `${updatedColumn} AS updated_at` : "NULL AS updated_at";

    const [rows] = await db.query(
      `SELECT media_id, title, ${imageColumn} AS image_url, display_order, ${createdSelect}, ${updatedSelect}
       FROM Gallery
       WHERE media_id = ?`,
      [mediaId]
    );
    return rows[0] || null;
  }

  static async create({ title, image_url, display_order }) {
    const imageColumn = await GalleryModel.getImageColumn();

    const [result] = await db.query(
      `INSERT INTO Gallery (title, ${imageColumn}, display_order)
       VALUES (?, ?, ?)`,
      [title || null, image_url, display_order || 0]
    );
    return result.insertId;
  }

  static async update(mediaId, { title, image_url, display_order }) {
    const imageColumn = await GalleryModel.getImageColumn();
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push("title = ?");
      values.push(title || null);
    }

    if (image_url !== undefined) {
      fields.push(`${imageColumn} = ?`);
      // Older schema uses NOT NULL file_url, so map explicit clear to empty string.
      values.push(image_url === null && imageColumn === "file_url" ? "" : image_url);
    }

    if (display_order !== undefined) {
      fields.push("display_order = ?");
      values.push(display_order);
    }

    if (fields.length === 0) return;

    values.push(mediaId);
    await db.query(
      `UPDATE Gallery SET ${fields.join(", ")} WHERE media_id = ?`,
      values
    );
  }

  static async delete(mediaId) {
    const imageColumn = await GalleryModel.getImageColumn();
    const [rows] = await db.query(`SELECT ${imageColumn} AS image_url FROM Gallery WHERE media_id = ?`, [mediaId]);
    const imagePath = rows[0]?.image_url || null;

    await db.query(`DELETE FROM Gallery WHERE media_id = ?`, [mediaId]);
    return imagePath;
  }
}

export default GalleryModel;
