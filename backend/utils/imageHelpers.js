/**
 * Backend Image Helper Functions
 * Consolidates image URL generation and processing utilities
 */

/**
 * Build complete image URL from request object and database path
 * @param {Object} req - Express request object
 * @param {string} dbPath - Image path from database
 * @returns {string|null} Complete image URL or null if dbPath is empty
 */
export function getImageUrl(req, dbPath) {
    if (!dbPath) return null;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const normalizedPath = dbPath.startsWith('/') ? dbPath.substring(1) : dbPath;
    return `${baseUrl}/${normalizedPath}`;
}

export default {
    getImageUrl,
};
