
import express from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import AdminController from "../controllers/adminController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const authValidation = [
    body("username").trim().isLength({ min: 1, max: 50 }).withMessage("Username is required").escape(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
];

const updatePasswordValidation = [
    body("oldPassword").isLength({ min: 8 }).withMessage("Old password required and must be at least 8 characters"),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters long"),
];

router.post("/login", authValidation, AdminController.login);
router.post("/logout", adminAuth, AdminController.logout);

router.put("/update-password", adminAuth, updatePasswordValidation, AdminController.updatePassword);
router.get("/me", adminAuth, (req, res) => {
  // Optional: issue a new token to extend session
  const token = jwt.sign(
    { admin_id: req.admin.admin_id, username: req.admin.username },
    process.env.JWT_SECRET,
    { expiresIn: "20m" }
  );

  res.cookie("adminToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 20 * 60 * 1000,
  });

  res.json({
    valid: true,
    username: req.admin.username,
  });
});

export default router;