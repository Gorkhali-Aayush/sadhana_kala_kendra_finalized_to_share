import multer from "multer";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = "uploads";
// Removed MAX_FILE_SIZE_MB constant

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Simple storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // Ensure filename is unique and preserves extension
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
});

// File filter: allows common image formats and MP4 video
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".mp4"];
    
    if (!file.mimetype.startsWith("image/") && file.mimetype !== "video/mp4") {
        return cb(new Error("Invalid MIME type"), false);
    }
    if (allowedExtensions.includes(ext)) {
        cb(null, true); 
    } else {
        // Reject file with a specific error message
        cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} are allowed.`), false);
    }
};

/**
 * Middleware export configured for general media uploads (single file).
 * It enforces storage and file type filtering. Size limits are removed.
 */
export const uploadMedia = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
    // The 'limits' configuration, including 'fileSize', has been removed to allow any size.
});