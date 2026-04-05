import fs from "fs/promises";
import path from "path";
import GalleryModel from "../models/galleryModel.js";
import { logAdminAction } from "../utils/auditLogger.js";
import { slugify } from "../utils/slug.js";
import { ERROR_MESSAGES, createFieldErrors, slugAlreadyExists } from "../utils/errorMessages.js";

class GalleryController {
  static async removeFile(filePath) {
    if (!filePath || !filePath.startsWith("/uploads/")) return;
    const fullPath = path.join(process.cwd(), filePath);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.error(`Error deleting file ${fullPath}:`, err);
      }
    }
  }

  /**
   * GALLERY COLLECTION ENDPOINTS
   */

  // GET /api/gallery - Get all gallery collections
  static async getAll(req, res, next) {
    try {
      const galleries = await GalleryModel.getAll();
      res.json(galleries);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/gallery/:id - Get gallery collection by ID with all images
  static async getById(req, res, next) {
    try {
      const galleryId = req.params.id;
      console.log(`[Gallery Controller] Fetching gallery with ID: ${galleryId}`);
      const gallery = await GalleryModel.getById(galleryId);
      if (!gallery) {
        console.log(`[Gallery Controller] Gallery not found for ID: ${galleryId}`);
        return res.status(404).json({ message: "Gallery not found" });
      }
      console.log(`[Gallery Controller] Successfully retrieved gallery with ${gallery.images?.length || 0} images`);
      res.json(gallery);
    } catch (err) {
      console.error(`[Gallery Controller] Error in getById: ${err.message}`, err);
      next(err);
    }
  }

  // POST /api/gallery - Create new gallery collection
  static async create(req, res, next) {
    try {
      const { title, description, display_order } = req.body;
      const thumbnail_image_url = req.file ? `/uploads/${req.file.filename}` : null;

      // Validate required fields with specific error messages
      const fieldErrors = [];

      if (!title?.trim()) {
        fieldErrors.push({ field: "title", message: ERROR_MESSAGES.GALLERY_TITLE_REQUIRED });
      }

      if (fieldErrors.length > 0) {
        if (req.file) await GalleryController.removeFile(`/uploads/${req.file.filename}`);
        return res.status(400).json(createFieldErrors(fieldErrors));
      }

      const slug = slugify(title);
      const displayOrderNum = display_order !== undefined && display_order !== null && display_order !== '' 
        ? parseInt(display_order, 10) 
        : 0;

      const galleryId = await GalleryModel.createGallery({
        title,
        slug,
        description: description || null,
        thumbnail_image_url,
        display_order: displayOrderNum
      });

      await logAdminAction({
        admin_id: req.admin.admin_id,
        action: "CREATE",
        entity: "GALLERY",
        entity_id: galleryId,
        ip: req.ip,
      });

      res.status(201).json({ message: "Gallery created", gallery_id: galleryId });
    } catch (err) {
      if (req.file) {
        await GalleryController.removeFile(`/uploads/${req.file.filename}`);
      }
      next(err);
    }
  }

  // PUT /api/gallery/:id - Update gallery collection
  static async update(req, res, next) {
    try {
      const galleryId = req.params.id;
      const { title, description, display_order } = req.body;

      const existing = await GalleryModel.getById(galleryId);
      if (!existing) {
        if (req.file) await GalleryController.removeFile(`/uploads/${req.file.filename}`);
        return res.status(404).json({ message: "Gallery not found" });
      }

      let thumbnail_image_url = undefined;
      if (req.file) {
        thumbnail_image_url = `/uploads/${req.file.filename}`;
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (display_order !== undefined) updateData.display_order = parseInt(display_order, 10);
      if (thumbnail_image_url !== undefined) updateData.thumbnail_image_url = thumbnail_image_url;

      await GalleryModel.updateGallery(galleryId, updateData);

      if (req.file && existing.thumbnail_image_url) {
        await GalleryController.removeFile(existing.thumbnail_image_url);
      }

      await logAdminAction({
        admin_id: req.admin.admin_id,
        action: "UPDATE",
        entity: "GALLERY",
        entity_id: galleryId,
        ip: req.ip,
      });

      res.json({ message: "Gallery updated" });
    } catch (err) {
      if (req.file) await GalleryController.removeFile(`/uploads/${req.file.filename}`);
      next(err);
    }
  }

  // DELETE /api/gallery/:id - Delete gallery collection (cascades to images)
  static async delete(req, res, next) {
    try {
      const galleryId = req.params.id;
      const imagePath = await GalleryModel.deleteGallery(galleryId);
      if (imagePath) {
        await GalleryController.removeFile(imagePath);
      }

      await logAdminAction({
        admin_id: req.admin.admin_id,
        action: "DELETE",
        entity: "GALLERY",
        entity_id: galleryId,
        ip: req.ip,
      });

      res.json({ message: "Gallery deleted" });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GALLERY IMAGES ENDPOINTS
   */

  // POST /api/gallery/:galleryId/images - Add image to gallery
  static async addImage(req, res, next) {
    try {
      const galleryId = req.params.galleryId;
      const { display_order } = req.body;
      const image_url = req.file ? `/uploads/${req.file.filename}` : null;

      if (!image_url) {
        return res.status(400).json({ message: "Image file is required" });
      }

      const gallery = await GalleryModel.getById(galleryId);
      if (!gallery) {
        await GalleryController.removeFile(`/uploads/${req.file.filename}`);
        return res.status(404).json({ message: "Gallery not found" });
      }

      const displayOrderNum = display_order !== undefined && display_order !== null && display_order !== '' 
        ? parseInt(display_order, 10) 
        : 0;

      const imageId = await GalleryModel.addImage({
        gallery_id: galleryId,
        image_url,
        display_order: displayOrderNum
      });

      await logAdminAction({
        admin_id: req.admin.admin_id,
        action: "CREATE",
        entity: "GALLERY_IMAGE",
        entity_id: imageId,
        ip: req.ip,
      });

      res.status(201).json({ message: "Image added to gallery", image_id: imageId });
    } catch (err) {
      if (req.file) {
        await GalleryController.removeFile(`/uploads/${req.file.filename}`);
      }
      next(err);
    }
  }

  // GET /api/gallery/:galleryId/images - Get all images for gallery
  static async getGalleryImages(req, res, next) {
    try {
      const galleryId = req.params.galleryId;
      const images = await GalleryModel.getGalleryImages(galleryId);
      res.json(images || []);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/gallery/images/:imageId - Update gallery image
  static async updateImage(req, res, next) {
    try {
      const imageId = req.params.imageId;
      const { display_order } = req.body;

      const existing = await GalleryModel.getImageById(imageId);
      if (!existing) {
        if (req.file) await GalleryController.removeFile(`/uploads/${req.file.filename}`);
        return res.status(404).json({ message: "Image not found" });
      }

      let image_url = undefined;
      if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
      }

      const updateData = {};
      if (display_order !== undefined) updateData.display_order = parseInt(display_order, 10);
      if (image_url !== undefined) updateData.image_url = image_url;

      await GalleryModel.updateImage(imageId, updateData);

      if (req.file && existing.image_url) {
        await GalleryController.removeFile(existing.image_url);
      }

      await logAdminAction({
        admin_id: req.admin.admin_id,
        action: "UPDATE",
        entity: "GALLERY_IMAGE",
        entity_id: imageId,
        ip: req.ip,
      });

      res.json({ message: "Image updated" });
    } catch (err) {
      if (req.file) await GalleryController.removeFile(`/uploads/${req.file.filename}`);
      next(err);
    }
  }

  // DELETE /api/gallery/images/:imageId - Delete image from gallery
  static async deleteImage(req, res, next) {
    try {
      const imageId = req.params.imageId;
      const imagePath = await GalleryModel.deleteImage(imageId);
      if (imagePath) {
        await GalleryController.removeFile(imagePath);
      }

      await logAdminAction({
        admin_id: req.admin.admin_id,
        action: "DELETE",
        entity: "GALLERY_IMAGE",
        entity_id: imageId,
        ip: req.ip,
      });

      res.json({ message: "Image deleted" });
    } catch (err) {
      next(err);
    }
  }
}

export default GalleryController;
