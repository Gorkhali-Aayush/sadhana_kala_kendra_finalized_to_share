// FILE: backend/middleware/compressionAndCachingMiddleware.js
// PURPOSE: Add response compression and caching headers for optimal performance
// INSTALLATION: 
//   1. npm install compression
//   2. Add this import and middleware to server.js

import compression from 'compression';

/**
 * Response Compression Middleware
 * - Compresses text responses with gzip (~70% size reduction)
 * - Only compresses responses > 1KB to avoid overhead on small responses
 * - Level 6 = good balance between speed and compression ratio
 */
export const compressionMiddleware = compression({
  level: 6, // 1-9, default 6. Higher = better compression but slower
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

/**
 * Cache Control Middleware Pattern
 * Different cache policies for different content types
 */

// 1. STATIC ASSETS - Cache for 30 days
export const staticAssetsCachingMiddleware = (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=2592000'); // 30 days
  next();
};

// 2. API ENDPOINTS CACHE CONTROL WRAPPER
// Usage: app.get('/api/courses', apiCacheControl(3600), CoursesController.getAll)
export const apiCacheControl = (maxAgeSeconds) => {
  return (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${maxAgeSeconds}`);
    next();
  };
};

// 3. NO-CACHE for admin/sensitive endpoints
export const noCachingMiddleware = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
};

// 4. ETAG Support for efficient caching
// Automatically generates ETags for responses
export const etagMiddleware = (req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    // Generate simple ETag from data hash
    const crypto = require('crypto');
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
    res.set('ETag', `"${hash}"`);
    
    // If client sends If-None-Match header
    if (req.headers['if-none-match'] === `"${hash}"`) {
      return res.status(304).end();
    }
    
    return originalJson.call(this, data);
  };
  next();
};

/**
 * EXAMPLE: How to use in server.js
 * 
 * ===== BEFORE =====
 * import express from "express";
 * import cors from "cors";
 * 
 * const app = express();
 * app.use(cors());
 * app.use(express.json({ limit: "1mb" }));
 * 
 * ===== AFTER (With Compression & Caching) =====
 * import express from "express";
 * import cors from "cors";
 * import {
 *   compressionMiddleware,
 *   staticAssetsCachingMiddleware,
 *   apiCacheControl,
 *   noCachingMiddleware,
 *   etagMiddleware
 * } from "./middleware/compressionAndCachingMiddleware.js";
 * 
 * const app = express();
 * 
 * // Trust proxy for proper IP detection in cPanel
 * app.set("trust proxy", 1);
 * 
 * // Apply compression to all responses
 * app.use(compressionMiddleware);
 * 
 * // Security & CORS
 * app.use(cors({ ... }));
 * app.use(express.json({ limit: "1mb" }));
 * 
 * // Static assets with long caching
 * app.use(
 *   "/uploads",
 *   staticAssetsCachingMiddleware,
 *   express.static(UPLOADS_DIR)
 * );
 * 
 * // Public API routes with 1-hour caching
 * app.use("/api/courses", apiCacheControl(3600), coursesRoutes);
 * app.use("/api/teachers", apiCacheControl(3600), teachersRoutes);
 * app.use("/api/gallery", apiCacheControl(3600), galleryRoutes);
 * 
 * // Short caching for frequently updated data
 * app.use("/api/offers", apiCacheControl(600), offersRoutes); // 10 minutes
 * app.use("/api/news", apiCacheControl(600), newsRoutes);     // 10 minutes
 * app.use("/api/events", apiCacheControl(300), eventsRoutes); // 5 minutes
 * 
 * // No caching for admin endpoints
 * app.use("/api/server", noCachingMiddleware, limiter, adminRoutes);
 * app.use("/api/register", noCachingMiddleware, registerRoutes);
 */

/**
 * CACHE DURATION RECOMMENDATIONS:
 * 
 * Static content (doesn't change often):
 * - Heroes images: 2592000 (30 days)
 * - Courses catalog: 3600 (1 hour)
 * - Teachers list: 3600 (1 hour)
 * - Artists list: 3600 (1 hour)
 * 
 * Dynamic content (changes frequently):
 * - Offers: 600 (10 minutes)
 * - News: 600 (10 minutes)
 * - Events: 300 (5 minutes)
 * - Gallery: 1800 (30 minutes)
 * 
 * User-specific/Admin:
 * - Admin endpoints: no-store (no caching)
 * - Registrations: no-cache
 * - User dashboard: no-store
 * 
 * SEO endpoints (important for crawlers):
 * - Sitemap: 3600 (1 hour)
 * - Detail pages: 86400 (24 hours)
 */

export default compressionMiddleware;
