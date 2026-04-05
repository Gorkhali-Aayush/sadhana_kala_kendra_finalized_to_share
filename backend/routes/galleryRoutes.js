import express from "express";
import GalleryController from "../controllers/galleryController.js";
import { adminAuth } from "../middleware/authMiddleware.js";
import { uploadMedia } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * GALLERY COLLECTION ROUTES
 */
router.get("/", GalleryController.getAll);                                    // Get all galleries

/**
 * GALLERY IMAGES ROUTES (must come BEFORE /:id to avoid route conflicts)
 */
router.get("/:galleryId/images", GalleryController.getGalleryImages);                      // Get all images for gallery
router.post("/:galleryId/images", uploadMedia.single("image_file"), adminAuth, GalleryController.addImage);   // Add image to gallery
router.put("/images/:imageId", uploadMedia.single("image_file"), adminAuth, GalleryController.updateImage);   // Update image
router.delete("/images/:imageId", adminAuth, GalleryController.deleteImage);               // Delete image

/**
 * SINGLE GALLERY ROUTES (must come AFTER /images routes)
 */
router.get("/:id", GalleryController.getById);                                // Get gallery by ID with images
router.post("/", uploadMedia.single("image_file"), adminAuth, GalleryController.create);   // Create gallery
router.put("/:id", uploadMedia.single("image_file"), adminAuth, GalleryController.update); // Update gallery
router.delete("/:id", adminAuth, GalleryController.delete);                   // Delete gallery

export default router;
