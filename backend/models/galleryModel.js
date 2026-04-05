import db from "../config/db.js";

class GalleryModel {
  /**
   * GALLERY COLLECTION METHODS
   */

  // Get all gallery collections with their first image as thumbnail
  static async getAll() {
    const [rows] = await db.query(`
      SELECT DISTINCT
        g.gallery_id,
        g.title,
        g.slug,
        g.description,
        g.thumbnail_image_url,
        g.display_order,
        g.created_at,
        g.updated_at,
        (SELECT COUNT(*) FROM Gallery_Images WHERE gallery_id = g.gallery_id) AS image_count
      FROM Gallery g
      ORDER BY g.display_order ASC, g.created_at DESC
    `);
    return rows;
  }

  // Get gallery collection by ID with all its images
  static async getById(galleryId) {
    try {
      console.log(`[Gallery Model] getById called with galleryId: ${galleryId} (type: ${typeof galleryId})`);
      
      const [galleries] = await db.query(`
        SELECT gallery_id, title, slug, description, thumbnail_image_url, display_order, created_at, updated_at
        FROM Gallery
        WHERE gallery_id = ?
      `, [galleryId]);

      console.log(`[Gallery Model] Query result - galleries array length: ${galleries?.length || 0}`);
      
      if (!galleries || galleries.length === 0) {
        console.log(`[Gallery Model] No gallery found for ID: ${galleryId}`);
        return null;
      }

      console.log(`[Gallery Model] Found gallery, now fetching images for gallery_id: ${galleries[0].gallery_id}`);
      
      const [images] = await db.query(`
        SELECT image_id, gallery_id, image_url, display_order, created_at, updated_at
        FROM Gallery_Images
        WHERE gallery_id = ?
        ORDER BY display_order ASC, created_at DESC
      `, [galleries[0].gallery_id]);

      console.log(`[Gallery Model] Found ${images?.length || 0} images for gallery`);
      
      const result = {
        ...galleries[0],
        images: images || []
      };
      
      console.log(`[Gallery Model] Returning gallery with ${result.images.length} images`);
      return result;
    } catch (err) {
      console.error(`[Gallery Model] Error in getById: ${err.message}`, err.stack);
      throw err;
    }
  }

  // Get gallery collection by slug with all its images
  static async getBySlug(slug) {
    const [galleries] = await db.query(`
      SELECT gallery_id, title, slug, description, thumbnail_image_url, display_order, created_at, updated_at
      FROM Gallery
      WHERE slug = ?
    `, [slug]);

    if (!galleries || galleries.length === 0) return null;

    const [images] = await db.query(`
      SELECT image_id, gallery_id, image_url, display_order, created_at, updated_at
      FROM Gallery_Images
      WHERE gallery_id = ?
      ORDER BY display_order ASC, created_at DESC
    `, [galleries[0].gallery_id]);

    return {
      ...galleries[0],
      images: images || []
    };
  }

  // Create new gallery collection
  static async createGallery({ title, slug, description, thumbnail_image_url, display_order }) {
    const [result] = await db.query(`
      INSERT INTO Gallery (title, slug, description, thumbnail_image_url, display_order)
      VALUES (?, ?, ?, ?, ?)
    `, [title, slug, description || null, thumbnail_image_url || null, display_order || 0]);
    return result.insertId;
  }

  // Update gallery collection
  static async updateGallery(galleryId, { title, slug, description, thumbnail_image_url, display_order }) {
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
    if (thumbnail_image_url !== undefined) {
      fields.push("thumbnail_image_url = ?");
      values.push(thumbnail_image_url);
    }
    if (display_order !== undefined) {
      fields.push("display_order = ?");
      values.push(display_order);
    }

    if (fields.length === 0) return;

    values.push(galleryId);
    await db.query(
      `UPDATE Gallery SET ${fields.join(", ")} WHERE gallery_id = ?`,
      values
    );
  }

  // Delete gallery collection (CASCADE deletes all images)
  static async deleteGallery(galleryId) {
    const [gallery] = await db.query(
      `SELECT thumbnail_image_url FROM Gallery WHERE gallery_id = ?`,
      [galleryId]
    );

    await db.query(`DELETE FROM Gallery WHERE gallery_id = ?`, [galleryId]);
    
    return gallery[0]?.thumbnail_image_url || null;
  }

  /**
   * GALLERY IMAGES METHODS
   */

  // Get all images for a gallery collection
  static async getGalleryImages(galleryId) {
    const [rows] = await db.query(`
      SELECT image_id, gallery_id, image_url, display_order, created_at, updated_at
      FROM Gallery_Images
      WHERE gallery_id = ?
      ORDER BY display_order ASC, created_at DESC
    `, [galleryId]);
    return rows;
  }

  // Get image by ID
  static async getImageById(imageId) {
    const [rows] = await db.query(`
      SELECT image_id, gallery_id, image_url, display_order, created_at, updated_at
      FROM Gallery_Images
      WHERE image_id = ?
    `, [imageId]);
    return rows[0] || null;
  }

  // Add image to gallery collection
  static async addImage({ gallery_id, image_url, display_order }) {
    const [result] = await db.query(`
      INSERT INTO Gallery_Images (gallery_id, image_url, display_order)
      VALUES (?, ?, ?)
    `, [gallery_id, image_url, display_order || 0]);
    return result.insertId;
  }

  // Update gallery image
  static async updateImage(imageId, { image_url, display_order }) {
    const fields = [];
    const values = [];

    if (image_url !== undefined) {
      fields.push("image_url = ?");
      values.push(image_url);
    }
    if (display_order !== undefined) {
      fields.push("display_order = ?");
      values.push(display_order);
    }

    if (fields.length === 0) return;

    values.push(imageId);
    await db.query(
      `UPDATE Gallery_Images SET ${fields.join(", ")} WHERE image_id = ?`,
      values
    );
  }

  // Delete image from gallery
  static async deleteImage(imageId) {
    const [image] = await db.query(
      `SELECT image_url FROM Gallery_Images WHERE image_id = ?`,
      [imageId]
    );

    await db.query(`DELETE FROM Gallery_Images WHERE image_id = ?`, [imageId]);
    
    return image[0]?.image_url || null;
  }
}

export default GalleryModel;
