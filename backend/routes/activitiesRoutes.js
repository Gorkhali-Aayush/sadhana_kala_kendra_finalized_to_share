import express from "express";
import ActivitiesController from "../controllers/activitiesController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ActivitiesController.getAll);
router.get("/:slug", ActivitiesController.getById);
router.post("/", adminAuth, ActivitiesController.create);
router.put("/:slug", adminAuth, ActivitiesController.update);
router.delete("/:slug", adminAuth, ActivitiesController.delete);

export default router;
