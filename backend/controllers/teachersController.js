import TeachersModel from "../models/teachersModel.js";
import { logAdminAction } from "../utils/auditLogger.js"; 
import { validateDisplayOrder } from "../utils/displayOrderValidator.js";
import fs from "fs/promises";
import path from "path";

// Define the root directory where files are stored (must match UPLOAD_DIR in uploadMiddleware)
const UPLOAD_DIR = "uploads"; 

function getImageUrl(req, dbPath) {
    if (!dbPath) return null;
    const baseUrl = `${req.protocol}://${req.get('host')}`; 
    const normalizedPath = dbPath.startsWith('/') ? dbPath.substring(1) : dbPath;
    return `${baseUrl}/${normalizedPath}`;
}

class TeachersController {
    // Utility to safely remove a file with path traversal protection
    static async removeFile(filePath) {
        if (!filePath) return;

        // 🔒 Path traversal protection: ensure filePath starts with /uploads/
        if (!filePath.startsWith("/uploads/") && !filePath.startsWith("uploads/")) return;

        const fullPath = path.join(process.cwd(), filePath);

        try {
            await fs.unlink(fullPath);
            console.log(`Successfully deleted old file: ${fullPath}`);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error(`Error deleting file ${fullPath}:`, err);
            }
        }
    }

    static async getAll(req, res, next) {
        try {
            let teachers = await TeachersModel.getAll();
            teachers = teachers.map(teacher => ({
                ...teacher,
                profile_image: getImageUrl(req, teacher.profile_image)
            }));
            res.json(teachers);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            let teacher = await TeachersModel.getById(req.params.id);
            if (!teacher) return res.status(404).json({ message: "Teacher not found" });
            teacher.profile_image = getImageUrl(req, teacher.profile_image);
            res.json(teacher);
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const { full_name, specialization, display_order } = req.body;
            const profile_image = req.file ? req.file.path.replace(/\\/g, "/") : null;

            if (!full_name) {
                if (req.file) await TeachersController.removeFile(profile_image);
                return res.status(400).json({ message: "Full Name is required" });
            }

            // Validate display order
            const orderValidation = await validateDisplayOrder(
                'Teachers',
                display_order,
                null,
                'teacher_id'
            );

            // If conflict, return warning
            if (!orderValidation.isValid) {
                if (req.file) await TeachersController.removeFile(profile_image);
                return res.status(409).json({
                    success: false,
                    message: 'Display order conflict detected',
                    warning: orderValidation.warning,
                    suggestion: orderValidation.suggestion,
                    nextAvailable: orderValidation.nextAvailable,
                    conflictingTeacherId: orderValidation.conflictData?.teacher_id,
                });
            }

            const id = await TeachersModel.create({ 
                full_name, 
                specialization, 
                profile_image,
                display_order: orderValidation.displayOrder
            });

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "TEACHER",
                entity_id: id,
                ip: req.ip
            });

            res.status(201).json({ 
                success: true,
                message: "Teacher created successfully", 
                id,
                display_order: orderValidation.displayOrder
            });

        } catch (err) {
            if (req.file) {
                const filePath = req.file.path.replace(/\\/g, "/");
                await TeachersController.removeFile(filePath);
            }
            next(err);
        }
    }

    static async update(req, res, next) {
        const teacherId = req.params.id;
        try {
            const { full_name, specialization, display_order, clear_image } = req.body;
            let new_image_path = undefined;

            if (req.file) {
                new_image_path = req.file.path.replace(/\\/g, "/");
            } else if (clear_image === 'true') {
                new_image_path = null;
            }

            if (!full_name) {
                if (req.file) await TeachersController.removeFile(new_image_path);
                return res.status(400).json({ message: "Full Name is required" });
            }

            // Validate display order if provided
            let finalDisplayOrder = undefined;
            if (display_order !== undefined) {
                const orderValidation = await validateDisplayOrder(
                    'Teachers',
                    display_order,
                    teacherId, // Exclude current teacher from conflict check
                    'teacher_id'
                );

                if (!orderValidation.isValid) {
                    if (req.file) await TeachersController.removeFile(new_image_path);
                    return res.status(409).json({
                        success: false,
                        message: 'Cannot update display order - conflict detected',
                        warning: orderValidation.warning,
                        suggestion: orderValidation.suggestion,
                        nextAvailable: orderValidation.nextAvailable,
                        conflictingTeacherId: orderValidation.conflictData?.teacher_id,
                    });
                }
                finalDisplayOrder = orderValidation.displayOrder;
            }

            const oldImagePath = await TeachersModel.update(teacherId, { 
                full_name, 
                specialization, 
                profile_image: new_image_path,
                display_order: finalDisplayOrder
            });

            if (oldImagePath) {
                await TeachersController.removeFile(oldImagePath);
            }
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "TEACHER",
                entity_id: teacherId,
                ip: req.ip
            });

            res.json({ 
                success: true,
                message: "Teacher updated successfully",
                display_order: finalDisplayOrder
            });
        } catch (err) {
            if (req.file) {
                const newFilePath = req.file.path.replace(/\\/g, "/");
                await TeachersController.removeFile(newFilePath);
            }
            next(err);
        }
    }

    static async delete(req, res, next) {
        try {
            const imagePathToDelete = await TeachersModel.delete(req.params.id);
            if (imagePathToDelete) {
                await TeachersController.removeFile(imagePathToDelete);
            }
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "DELETE",
                entity: "TEACHER",
                entity_id: req.params.id,
                ip: req.ip
            })
            res.json({ message: "Teacher deleted successfully" });
        } catch (err) {
            next(err);
        }
    }
}

export default TeachersController;
