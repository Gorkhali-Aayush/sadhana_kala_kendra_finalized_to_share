import ArtistModel from "../models/artistModel.js";
import fs from "fs/promises";
import path from "path";
import { logAdminAction } from "../utils/auditLogger.js"; // Updated import
import { slugify } from "../utils/slug.js";
import { getImageUrl } from "../utils/imageHelpers.js";


class ArtistController {
  static async removeFile(filePath) {
    if (!filePath) return;

    // 🔒 Path traversal protection
    if (!filePath.startsWith("/uploads/")) return;

    const fullPath = path.join(process.cwd(), filePath);

    try {
      await fs.unlink(fullPath);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        // Error deleting file
      }
    }
  }

  // GET all artists
  static async getAll(req, res, next) {
    try {
      const artists = await ArtistModel.getAll();
      res.json(artists);
    } catch (err) {
      next(err);
    }
  }

  // GET artist by ID
  static async getById(req, res, next) {
    try {
      const slugOrId = req.params.slug;
      const artist = Number.isFinite(Number(slugOrId))
        ? await ArtistModel.getById(slugOrId)
        : await ArtistModel.getBySlug(slugOrId);
      if (!artist) return res.status(404).json({ message: "Artist not found" });
      res.json(artist);
    } catch (err) {
      next(err);
    }
  }

  // CREATE artist
  static async create(req, res, next) {
    try {
      const { full_name, bio, slug, seo_title, seo_description, seo_keywords, display_order } = req.body;

      // Multer saves the file → we store only the relative path
      const profile_image = req.file ? `/uploads/${req.file.filename}` : null;

      const displayOrderNum = display_order !== undefined && display_order !== null && display_order !== '' 
        ? parseInt(display_order, 10) 
        : 0;

      const id = await ArtistModel.create({
        full_name,
        slug: slugify(slug || full_name),
        bio,
        profile_image,
        seo_title,
        seo_description,
        seo_keywords,
        display_order: displayOrderNum,
      });
      await logAdminAction({
        admin_id: req.admin.admin_id,
        action: "CREATE",
        entity: "ARTIST",
        entity_id: id,
        ip: req.ip
      });

      res.status(201).json({ message: "Artist created", id });
    } catch (err) {
      if (err?.code === "ER_DUP_ENTRY") {
        if (req.file) await ArtistController.removeFile(`/uploads/${req.file.filename}`);
        return res.status(409).json({ message: "Slug already exists." });
      }
      if (req.file) await ArtistController.removeFile(`/uploads/${req.file.filename}`);
      next(err);
    }
  }

  // UPDATE artist
  static async update(req, res, next) {
  try {
    const { full_name, bio, slug, seo_title, seo_description, seo_keywords, display_order } = req.body;
    let profile_image = undefined; // only set if new file uploaded

    if (req.file) {
      profile_image = `/uploads/${req.file.filename}`;
      const existing = await ArtistModel.getById(req.params.id);
      if (existing && existing.profile_image) {
        await ArtistController.removeFile(existing.profile_image);
      }
    }

    const displayOrderNum = display_order !== undefined && display_order !== null && display_order !== '' 
      ? parseInt(display_order, 10) 
      : undefined;

    await ArtistModel.update(req.params.id, {
      full_name,
      slug: slug !== undefined || full_name !== undefined ? slugify(slug || full_name) : undefined,
      bio,
      profile_image,
      seo_title,
      seo_description,
      seo_keywords,
      display_order: displayOrderNum,
    });

    await logAdminAction({
      admin_id: req.admin.admin_id,
      action: "UPDATE",
      entity: "ARTIST",
      entity_id: req.params.id, 
      ip: req.ip
    });

    res.json({ message: "Artist updated" });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      if (req.file) await ArtistController.removeFile(`/uploads/${req.file.filename}`);
      return res.status(409).json({ message: "Slug already exists." });
    }
    if (req.file) await ArtistController.removeFile(`/uploads/${req.file.filename}`);
    next(err);
  }
}


  // DELETE artist
  static async delete(req, res, next) {
    try {
      const existing = await ArtistModel.getById(req.params.id);
      if (existing && existing.profile_image) {
        await ArtistController.removeFile(existing.profile_image);
      }

      await ArtistModel.delete(req.params.id);
      await logAdminAction({
        admin_id: req.admin.admin_id,
        action: "DELETE",
        entity: "ARTIST",
        entity_id: req.params.id,
        ip: req.ip
      });
      res.json({ message: "Artist deleted" });
    } catch (err) {
      next(err);
    }
  }
}

export default ArtistController;
