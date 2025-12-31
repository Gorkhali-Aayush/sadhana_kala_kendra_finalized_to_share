import express from "express";
import TeachersController from "../controllers/teachersController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

import { uploadMedia } from "../middleware/uploadMiddleware.js"; 

const router = express.Router();

// PUBLIC ROUTES
router.get("/", TeachersController.getAll);
router.get("/:id", TeachersController.getById);

// ADMIN ROUTES (CRUD)
router.post("/", adminAuth, uploadMedia.single("profile_image"), TeachersController.create);
router.put("/:id", adminAuth, uploadMedia.single("profile_image"), TeachersController.update);
router.delete("/:id", adminAuth, TeachersController.delete);

export default router;