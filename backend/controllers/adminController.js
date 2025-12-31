import AdminModel from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { logAdminAction } from "../utils/auditLogger.js"; 
class AdminController {
  static async login(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const { username, password } = req.body;
    const genericErrorMessage = "Login failed. Check your credentials.";

    try {
      const admin = await AdminModel.findByUsername(username);

      if (!admin) {
        return res.status(401).json({ message: genericErrorMessage });
      }

      // Trim the password from the database
      const dbPasswordHash = admin.password;

      const isMatch = await bcrypt.compare(password, dbPasswordHash);

      if (!isMatch) {
        return res.status(401).json({ message: genericErrorMessage });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("FATAL: JWT_SECRET environment variable is missing.");
      }

      const token = jwt.sign(
        { admin_id: admin.admin_id, username: admin.username },
        process.env.JWT_SECRET,
        { expiresIn: "20m" }
      );

      // Set token as HttpOnly cookie
      res.cookie("adminToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
        maxAge: 30 * 60 * 1000,
      });

      res.json({
        message: "Login successful",
        username: admin.username,
      });
    } catch (err) {
      next(err);
    }
  }
  

  static async logout(req, res, next) {
    try {
      res.clearCookie("adminToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/", 
      });

      res.json({ message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  }

  static async updatePassword(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { oldPassword, newPassword } = req.body;
    const adminId = req.admin.admin_id;

    try {
      const hashedPassword = await AdminModel.getHashedPassword(adminId);

      if (!hashedPassword) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const dbHashedPassword = hashedPassword.trim();
      const isMatch = await bcrypt.compare(oldPassword, dbHashedPassword);

      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect current password" });
      }

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      const updated = await AdminModel.updatePassword(
        adminId,
        newHashedPassword
      );

      if (!updated) {
        return res.status(500).json({ message: "Password update failed" });
      }
      
      res.clearCookie("adminToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
      });

      res.json({ message: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
    await logAdminAction({
  admin_id: req.admin.admin_id,
  action: "UPDATE",
  entity: "ADMIN_PASSWORD",
  entity_id: req.admin.admin_id,
  ip: req.ip
});
  }
}

export default AdminController;
